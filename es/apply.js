Function.prototype.apply = function (ctx, args) {
  ctx.__$$fn__ = this
  ctx.__$$fn__(...args)
  delete ctx.__$$fn__
}