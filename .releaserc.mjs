export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { breaking: true, release: "minor" }, // TODO: v2になったら release: "major" にする
          { type: "feat", release: "minor" },
          { type: "build", release: "minor" },
          { type: "style", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "refactor", release: "patch" },
          { revert: true, release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "style", section: "🎨 Styles" },
            { type: "fix", section: "🛡️ Bug Fixes" },
            { type: "build", section: "🤖 Build" },
            { type: "docs", hidden: true },
            { type: "refactor", hidden: true },
            { type: "test", hidden: true },
            { type: "ci", hidden: true },
            { type: "dev", hidden: true },
            { type: "chore", hidden: true },
          ],
        },
      },
    ],
    "@sebbo2002/semantic-release-jsr",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["deno.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
