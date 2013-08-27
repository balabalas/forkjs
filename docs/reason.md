# 这个库的目的
做这个库，主要是个人理解与seajs的理念有些不同，所以做了一些尝试性的修改，并做了一些实验性的东西。


## 关于seajs加载的几点
1. seajs由于浏览器特性限制，所以在理念上采用了异步的方式。   
  * 解析要加载的代码，提取里面所有的依赖
  * 加载所有的依赖，如果其仍有依赖，继续加载依赖
  * 如果所有依赖加载完成，则开始执行代码。
2. seajs和requirejs一样，需要一个define()包装函数。   
  这个包装函数内的东西即为一个模块。


   

======

### 可能的问题
1. 如果依赖比较多，将会导致第一行执行代码等待较长时间，造成停滞的感觉
2. 其做出了一套 __CMD__ 方案，与 __AMD__ 方案并不相同。虽然与 __CommonJS__ 有些相似之处，但仍有差别


   


## 改动
1. 缩小使用环境。只在缓存与完全本地化(Phonegap等)环境中使用，这样就可以同步调用
2. 尝试完全类Node.js风格的模块化。 其中最重要的是保护 __window__ 对象不被污染

   

=======

### 可能的问题
1. 在需要网络的环境下，可能表现为不可用。
2. 此为试验性质



   

   

## 示例
1. seajs 的一次加载所有依赖
  ```javascript
    
    define(function(require, exports, module){
      
      var operator = '+';
      var handler;

      // seajs 会用正则匹配提取并加载所有require, 不管其有没有被调用
      switch (operator) {
        case '+': handler = require('plus.js'); break;
        case '-': handler = require('sub.js'); break;
        case '*': handler = require('multi.js'); break;
        case '/': handler = require('divi.js'); break;
      }

      var res = handler(a, b);
    });
  ```



