/**
 * 公共辅助函数（原内联在各页面中）
 */
function remWidth(el) {
    el.style.width = el.naturalWidth / 100 + 'rem'
}
function remHeight(el) {
    el.style.height = el.naturalHeight / 100 + 'rem'
}
function percentWidth(el, w) {
    el.style.width = el.naturalWidth / w * 100 + '%'
}
