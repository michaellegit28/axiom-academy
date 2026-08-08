# axiom-academy

Axiom Academy — a free, university-standard self-study library covering Physics, Medicine, and Science.

## Quick start

This repository is a Jekyll-based static site (GitHub Pages compatible). It contains learning content (Markdown chapters), layouts, and assets.

### Run locally

Prerequisites: Ruby (2.7+ or as required by your Gemfile), Bundler.

```bash
# install dependencies
bundle install

# build and serve locally
bundle exec jekyll serve --livereload
```

### Notes / maintenance

- I found several Markdown files containing stray control characters that broke LaTeX/math rendering; I've fixed the most obvious ones and opened an issue to remove large zip archives from the repo history (they currently bloat the repository).
- Large binary archives (axiom-academy-phase*.zip) should be moved to GitHub Releases or stored with Git LFS; do not keep them in the main repository history if you can avoid it.

### Contribution

- Edit or add chapters in the `physics/`, `jamb/`, and `waec/` directories. Use the existing front-matter (`layout: chapter`, `permalink`, `chapter_number`, etc.).
- Run `bundle exec jekyll build` to confirm rendering.

