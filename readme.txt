从bootstrap的示例中拷贝
https://github.com/twbs/examples/tree/main/webpack



-----------
// load any GitHub release, commit, or branch
// note: we recommend using npm for projects that support it
https://cdn.jsdelivr.net/gh/user/repo@version/file
github:
https://cdn.jsdelivr.net/gh/chenhl/luv@main/dist/css/style.css

------------
npm :
https://cdn.jsdelivr.net/npm/luv-assets@latest/dist/css/style.css
# 首次发布
npm publish
# 如果是 scoped package (如 @your-username/package-name)
npm publish --access public

# 更新版本号 (major/minor/patch)
npm version patch

# 发布新版本
npm publish