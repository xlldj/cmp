webpackJsonp([79],{1105:function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}function u(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var a=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),c=n(5),f=function(e){return e&&e.__esModule?e:{default:e}}(c),l=n(134),p=n(136),d=(0,p.asyncComponent)(function(){return n.e(23).then(n.bind(null,1107))}),s=(0,p.asyncComponent)(function(){return n.e(16).then(n.bind(null,1106))}),h=function(e){function t(){return r(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return u(t,e),i(t,[{key:"render",value:function(){var e=this;return f.default.createElement("div",null,f.default.createElement(l.Switch,null,f.default.createElement(l.Route,{path:"/fund/deposit/depositInfo/:id",render:function(t){return f.default.createElement(s,a({hide:e.props.hide},t))}}),f.default.createElement(l.Route,{path:"/fund/deposit/addDeposit",render:function(t){return f.default.createElement(s,a({hide:e.props.hide},t))}}),f.default.createElement(l.Route,{exact:!0,path:"/fund/deposit",render:function(t){return f.default.createElement(d,a({hide:e.props.hide},t))}})))}}]),t}(f.default.Component);t.default=h}});