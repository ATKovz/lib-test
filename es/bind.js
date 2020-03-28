Function.prototype.sbind = function (ctx, ...args) {
  return (...nextArgs) => {
    return this.apply(ctx, [...args, ...nextArgs])
  }
} 