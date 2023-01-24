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

## Output
Only table is the content created by this action.
![output image](https://user-images.githubusercontent.com/21301787/214192895-918f8eb4-e05d-4d42-9e07-8a1ba5c0e9d1.png)
