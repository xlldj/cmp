webpackJsonp([76],{1115:function(e,t,n){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!==typeof t&&"function"!==typeof t?e:t}function u(e,t){if("function"!==typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},a=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),l=n(5),f=function(e){return e&&e.__esModule?e:{default:e}}(l),c=n(134),p=n(136),s=(0,p.asyncComponent)(function(){return n.e(26).then(n.bind(null,1118))}),d=(0,p.asyncComponent)(function(){return n.e(7).then(n.bind(null,1117))}),h=function(e){function t(){return r(this,t),o(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return u(t,e),a(t,[{key:"render",value:function(){var e=this;return f.default.createElement("div",null,f.default.createElement(c.Switch,null,f.default.createElement(c.Route,{path:"/gift/list/giftInfo/:id",render:function(t){return f.default.createElement(d,i({hide:e.props.hide},t))}}),f.default.createElement(c.Route,{path:"/gift/list/addGift",render:function(t){return f.default.createElement(d,i({hide:e.props.hide},t))}}),f.default.createElement(c.Route,{path:"/gift/list",render:function(t){return f.default.createElement(s,i({hide:e.props.hide},t))}})))}}]),t}(f.default.Component);t.default=h}});