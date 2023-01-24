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

## Resource not accessible by integration
Repo's default policy only allows `read` permission.  
You need to enable `write` permission.  

Select one way from below.
#### Change repository setting
- move to `Settings > Actions > General`
- scroll down to end and check `Read and write permissions`
- save settings

#### Change workflow yaml
- move to your yaml file which uses rustlings-progress
- add below line to your job
  ```
  permissions: write-all
  ```
- save yaml file
  

## Output
Only table is the content created by this action.  
  
  
![output image](https://user-images.githubusercontent.com/21301787/214192895-918f8eb4-e05d-4d42-9e07-8a1ba5c0e9d1.png)
