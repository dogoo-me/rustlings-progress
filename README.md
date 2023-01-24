# rustlings-progress
github action for rustlings progress

## Usage
```yaml
jobs: 
  Progress-Update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dogoo-me/rustlings-progress@v1
        with:
          github_token: ${{github.token}}
```