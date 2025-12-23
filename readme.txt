从bootstrap的示例中拷贝
https://github.com/twbs/examples/tree/main/webpack

--------------
webpack 负责定制bootstrap的样式

npm install -g terser
terser 负责压缩js 
    terser --help
    示例：
    terser src/js/js.js -o dist/js/js.min.js
    terser src/js/product.js -o dist/js/product.min.js
    terser src/js/category.js -o dist/js/category.min.js
    terser src/js/search.js -o dist/js/search.min.js
    terser src/js/search-text.js -o dist/js/search-text.min.js
    terser src/js/login.js -o dist/js/login.min.js
    terser src/js/register.js -o dist/js/register.min.js
    terser src/js/forgot-password.js -o dist/js/forgot-password.min.js
    terser src/js/reset-password.js -o dist/js/reset-password.min.js
    terser src/js/order.js -o dist/js/order.min.js
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