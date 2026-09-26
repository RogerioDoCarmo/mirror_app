// The two services in this repository that bill per run — EAS Build and
// Chromatic — and the triggers that were quietly paying them. Everything
// asserted here is a spend decision, not a behaviour of the app: revert any of
// it and the tests stay green, the app ships identically, and the only signal
// is a number on someone else's invoice. That is exactly why it is pinned here.
import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS = __dirname;
const ROOT = path.join(__dirname, '..', '..');

const workflow = (name: string): string => fs.readFileSync(path.join(WORKFLOWS, name), 'utf8');

const EAS_BUILD = workflow('eas-build.yml');
const CHROMATIC = workflow('chromatic.yml');
const README = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

interface EasProfile {
  autoIncrement?: boolean;
  extends?: string;
}

interface EasJson {
  cli: { appVersionSource: string };
  build: Record<string, EasProfile>;
}

const EAS_JSON = JSON.parse(fs.readFileSync(path.join(ROOT, 'eas.json'), 'utf8')) as EasJson;

/** The `on:` block of a workflow, up to the next top-level key. */
const triggerBlock = (source: string): string => {
  const start = source.indexOf('\non:\n');
  expect(start).toBeGreaterThan(-1);
  const rest = source.slice(start + '\non:\n'.length);
  const next = rest.search(/\n\w[\w-]*:/u);
  return next === -1 ? rest : rest.slice(0, next);
};

/** The event names a workflow subscribes to, ignoring their configuration. */
const triggers = (source: string): string[] =>
  [...triggerBlock(source).matchAll(/^ {2}([a-z_]+):/gmu)].map((found) => found[1] as string);

/** The job block for `id:`, up to the next top-level job key. */
const job = (source: string, id: string): string => {
  const start = source.indexOf(`\n  ${id}:\n`);
  expect(start).toBeGreaterThan(-1);
  const rest = source.slice(start + 1);
  const next = rest.search(/\n {2}\w[\w-]*:\n/u);
  return next === -1 ? rest : rest.slice(0, next);
};

describe('no git operation wakes a paid EAS build', () => {
  /**
   * ⚠️ IT USED TO BUILD ON EVERY PUSH TO MAIN, path-filtered on `src/**`,
   * `app.json`, `package.json` and the lockfile. Miroji's main is fed by
   * "Merge pull request #NNN from RogerioDoCarmo/develop" merges, which match
   * those paths nearly every time, so a dependency bump bought two remote build
   * credits. All 47 runs this workflow ever had were push-triggered; not one
   * was asked for by a person.
   */
  it('subscribes to nothing but a manual dispatch', () => {
    expect(triggers(EAS_BUILD)).toStrictEqual(['workflow_dispatch']);
  });

  // Named separately from the assertion above, because "no push" is the part
  // that gets helpfully restored by someone wiring up a release pipeline.
  it('has no push trigger of any kind, tags included', () => {
    expect(triggerBlock(EAS_BUILD)).not.toContain('push:');
  });
});

describe('a refused build cannot burn the remote build number', () => {
  /**
   * ⚠️ EAS INCREMENTS BEFORE IT CHECKS THE PLAN. `appVersionSource: "remote"`
   * puts versionCode/buildNumber on EAS's side, and `eas build` bumps them as
   * its first act. Six runs of the old push trigger logged an increment and then
   * `This account has used its builds from the Free plan this month` seconds
   * later: Android 48→49, 49→50, 52→53, 54→55, 55→56 and 56→57, every one of
   * them with no binary behind it. Nothing in a repository can give a burned
   * build number back.
   */
  it('gates the build job on a confirmation job that runs first', () => {
    expect(job(EAS_BUILD, 'build')).toContain('needs: check-credits');
    expect(job(EAS_BUILD, 'build')).toContain(
      "if: needs.check-credits.outputs.confirmed == 'true'",
    );
  });

  it('never invokes the EAS CLI inside the gate itself', () => {
    expect(job(EAS_BUILD, 'check-credits')).not.toContain('eas build');
    expect(job(EAS_BUILD, 'check-credits')).not.toContain('expo-github-action');
  });

  // Fail closed. A dispatch where nobody answered the question must not build.
  it('defaults the confirmation to no', () => {
    const input = EAS_BUILD.slice(EAS_BUILD.indexOf('credits_available:'));

    expect(/default:\s*'no'/u.test(input.slice(0, 300))).toBe(true);
  });

  /**
   * ⚠️ A `type: boolean` input would silently never match. GitHub coerces both
   * sides of `==` to numbers, so a real boolean compared with the string
   * `'true'` is `1 == NaN` — false forever, and a gate that is always closed
   * reads exactly like a gate that works. `type: choice` keeps both sides
   * strings, which is why this input is a two-option choice and not a checkbox.
   */
  it('makes the confirmation a string choice rather than a boolean', () => {
    const input = EAS_BUILD.slice(EAS_BUILD.indexOf('credits_available:'), EAS_BUILD.length);

    expect(input.slice(0, 300)).toContain('type: choice');
    expect(input.slice(0, 300)).toContain("options: ['no', 'yes']");
  });

  /**
   * The gate above is a workaround for a remote counter. If `appVersionSource`
   * ever becomes `"local"`, the counter lives in `app.json`, nothing can burn
   * it, and the whole gate is dead weight worth deleting — so this test exists
   * to fail and say so rather than to defend `remote` as a good idea.
   */
  it('still has a remote counter to protect', () => {
    expect(EAS_JSON.cli.appVersionSource).toBe('remote');
    expect(EAS_JSON.build.production?.autoIncrement).toBe(true);
  });
});

describe('only the production profile is allowed to move the counter', () => {
  // The distribution and E2E profiles run on every bump and every push
  // respectively. An autoIncrement on either would spend build numbers dozens
  // of times faster than releases consume them.
  it.each(['development', 'preview', 'e2e', 'firebase'])(
    'leaves %s without autoIncrement',
    (id) => {
      expect(EAS_JSON.build[id]).toBeDefined();
      expect(EAS_JSON.build[id]?.autoIncrement).toBeUndefined();
    },
  );

  it('keeps the e2e profile inheriting from preview, which also has none', () => {
    expect(EAS_JSON.build.e2e?.extends).toBe('preview');
  });
});

describe('every automatically triggered eas build stays on the runner', () => {
  /**
   * ⚠️ `--local` is the difference between borrowing a GitHub runner and buying
   * a build credit, and it is one word long. The firebase and e2e jobs fire on
   * version bumps and on every push and pull request; without the flag they
   * would outspend releases many times over. A workflow that only a human can
   * start is exempt — that is what eas-build.yml is for.
   */
  it.each(
    fs
      .readdirSync(WORKFLOWS)
      .filter((name) => name.endsWith('.yml'))
      .map((name) => [name, workflow(name)] as const)
      .filter(([, source]) =>
        triggers(source).some((event) => event !== 'workflow_dispatch' && event !== 'schedule'),
      ),
  )('%s builds locally or not at all', (_name, source) => {
    const builds = source.split('\n').filter((line) => line.includes('eas build'));

    for (const line of builds) {
      expect(line).toContain('--local');
    }
  });
});

describe('Chromatic is not billed twice for the same tree', () => {
  /**
   * ⚠️ EVERY COMMIT ON DEVELOP ARRIVED THROUGH A PULL REQUEST that had already
   * published a Chromatic build of that same tree, so the push run bought a
   * second snapshot of work nothing had changed. The website repo put the same
   * finding in the same words about its Storybook job: four Chromatic builds
   * per change instead of two, while telling us nothing new.
   */
  it('does not snapshot pushes to develop', () => {
    expect(triggerBlock(CHROMATIC)).toContain('branches: [main]');
    expect(triggerBlock(CHROMATIC)).not.toContain('push:\n    branches: [main, develop]');
  });

  /**
   * ⚠️ main's push run is NOT the same waste, and deleting it breaks something
   * visible. Chromatic files a pull request build under its head branch, never
   * its base, so the `main--…` permalink the README badge points at is fed only
   * by pushes to main. No build on main, no published Storybook.
   */
  it('keeps the push run on main that feeds the published Storybook link', () => {
    expect(triggers(CHROMATIC)).toContain('push');
    expect(README).toContain('main--6a2ef191cad660cc8d53a313.chromatic.com');
  });

  it('still snapshots pull requests into both long-lived branches', () => {
    expect(triggers(CHROMATIC)).toContain('pull_request');
    expect(triggerBlock(CHROMATIC)).toContain('branches: [main, develop]');
  });

  // TurboSnap is not a cap — it falls back to a full build whenever
  // package.json or .storybook/** changes — but without it every push
  // snapshots every story regardless.
  it('leaves TurboSnap on', () => {
    expect(CHROMATIC).toContain('onlyChanged: true');
  });
});
