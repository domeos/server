'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

;(function (backendApi) {
  "use strict";

  backendApi.factory('api', ['$http', '$timeout', function ($http, $timeout) {
    var api = {};

    var friendlyErrerMessage = {};

    // 一个简易的 Promise
    // 仿照原生的接口（因为没有用 Symbol ，所以其实也不完全是原生的接口）
    // 回调被包裹在 $timeout 里面，以保证可以触发 $digest 周期
    api.SimplePromise = function SimplePromise(resolver) {
      var state = null,
          value = null;
      var callbacks = [];
      var self = this,
          waiting = null;
      var resolve = function resolve(v) {
        if (v === self) throw 'promise should not be resolve by itself';
        if (((typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' || typeof v === 'function') && v && 'then' in v && typeof v.then === 'function') {
          waiting = true;
          try {
            v.then(resolve, reject);
          } catch (e) {
            reject(e);
          }
        } else {
          state = true;value = v;
          setTimeout(handleCallbacks, 0);
        }
      };
      var reject = function reject(v) {
        state = false;value = v;
        setTimeout(handleCallbacks, 0);
      };
      try {
        resolver(function (value) {
          if (state !== null || waiting !== null) return;
          resolve(value);
        }, function (reason) {
          if (state !== null || waiting !== null) return;
          reject(reason);
        });
      } catch (e) {
        if (state !== null || waiting !== null) return;
        state = false;value = e;
        setTimeout(handleCallbacks, 0);
      }
      resolver = null;
      var handleCallbacks = function handleCallbacks() {
        if (state === null) return;

        var _loop = function _loop() {
          var _callbacks$shift = callbacks.shift(),
              onFullfilled = _callbacks$shift.onFullfilled,
              onRejected = _callbacks$shift.onRejected,
              resolve = _callbacks$shift.resolve,
              reject = _callbacks$shift.reject;

          var callback = state ? onFullfilled : onRejected;
          if (!callback || typeof callback !== 'function') {
            (state ? resolve : reject)(value);
          } else {
            $timeout(function () {
              try {
                resolve(callback(value));
              } catch (e) {
                reject(e);
              }
            });
          }
        };

        while (callbacks.length) {
          _loop();
        }
      };
      var promise = function promise(onFullfilled, onRejected, resolve, reject) {
        callbacks.push({ onFullfilled: onFullfilled, onRejected: onRejected, resolve: resolve, reject: reject });
        setTimeout(handleCallbacks, 0);
      };
      Object.defineProperty(this, 'promise', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: promise
      });
    };
    api.SimplePromise.prototype.then = function (onFullfilled, onRejected) {
      var that = this;
      return new api.SimplePromise(function (resolve, reject) {
        that.promise(onFullfilled, onRejected, resolve, reject);
      });
    };
    api.SimplePromise.prototype.catch = function (onRejected) {
      var that = this;
      return new api.SimplePromise(function (resolve, reject) {
        that.promise(void 0, onRejected, resolve, reject);
      });
    };
    api.SimplePromise.all = function (promises) {
      return new api.SimplePromise(function (resolve, reject) {
        var values = [],
            done = 0;
        try {
          [].concat(_toConsumableArray(promises)).forEach(function (promise, index) {
            promise.then(function (value) {
              values[index] = value;
              if (++done === promises.length) resolve(values);
            }).catch(function (reason) {
              reject(reason);
            });
          });
        } catch (e) {
          reject(e);
        }
      });
    };
    api.SimplePromise.race = function (promises) {
      return new api.SimplePromise(function (resolve, reject) {
        try {
          [].concat(_toConsumableArray(promises)).forEach(function (promise) {
            return promise.then(resolve).catch(reject);
          });
        } catch (e) {
          reject(e);
        }
      });
    };
    api.SimplePromise.reject = function (reason) {
      return new api.SimplePromise(function (resolve, reject) {
        reject(reason);
      });
    };
    api.SimplePromise.resolve = function (value) {
      return new api.SimplePromise(function (resolve, reject) {
        resolve(value);
      });
    };

    // 懒加载某个 js 文件
    api.loadScript = function () {
      var cache = Object.create({});
      var loader = function loader(src, checker, initial) {
        if (checker && checker()) {
          return api.SimplePromise.resolve(true);
        }
        return new api.SimplePromise(function (resolve, reject) {
          var loadDone = function loadDone() {
            resolve(checker ? checker() : true);
          };
          var script = document.createElement('script');
          script.src = src;
          script.type = 'text/javascript';
          script.addEventListener('load', function () {
            if (typeof initial === 'function') {
              api.SimplePromise.resolve(initial()).then(loadDone);
            } else loadDone();
          });
          var parent = document.body || document.getElementsByTagName('head')[0];
          parent.appendChild(script);
        });
      };
      return function (src, checker, initial) {
        if (!cache.hasOwnProperty(src)) {
          cache[src] = loader(src, checker, initial);
        }
        return cache[src];
      };
    }();

    // 用来定义一个网络接口
    var network = function network(method, url, more) {
      return function (data) {
        for (var _len = arguments.length, details = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          details[_key - 1] = arguments[_key];
        }

        return new api.SimplePromise(function (resolve, reject) {
          var _angular;

          var args = (_angular = angular).merge.apply(_angular, [{}, { method: method, url: url }, more, { data: data }].concat(details));
          console.log('[NETWORK][REQUEST] %s %s\n%o', args.method, args.url, args);
          var handleResponse = function handleResponse(response) {
            try {
              var success = true;
              if (response.status < 200 || response.status >= 300) success = false;
              var _data = response.data;
              if (success) {
                if (response.status === 401) {
                  location.href = '/login/login.html';
                  return;
                }
              }
              var result = null,
                  error = null;
              if (success) {
                if (typeof _data === 'string') result = _data;else if (_data instanceof ArrayBuffer) result = _data;else if ((typeof _data === 'undefined' ? 'undefined' : _typeof(_data)) === 'object') {
                  if (_data.resultCode === 200) result = _data.result;else {
                    success = false;error = _data.resultMsg;
                  }
                } else {
                  success = false;
                }
              }
              if (success) {
                console.log('[NETWORK][RESPONSE] %s %s\n%o', args.method, args.url, result);
                resolve(result);
              } else {
                var msg = error || '请求处理时发生错误';
                if (msg in friendlyErrerMessage) msg = friendlyErrerMessage[msg];
                console.warn('[NETWORK][FAIL] %s %s\n%o', args.method, args.url, msg);
                reject(new Error(msg));
              }
            } catch (e) {
              console.warn('[NETWORK][EXCEPTION] %s %s\n%o', args.method, args.url, e);
              reject(new Error(''));
            }
          };
          $http(args).then(handleResponse, handleResponse);
        });
      };
    };

    // 用来定义一个本地计算的数据
    var fake = function fake(handler) {
      return function () {
        var result = void 0,
            exception = void 0,
            success = true;
        try {
          result = handler.apply(undefined, arguments);
        } catch (e) {
          exception = e;success = false;
        }
        if (success) return api.SimplePromise.resolve(angular.copy(result));else return api.SimplePromise.reject(angular.copy(exception));
      };
    };
    var constant = function constant(x) {
      return function () {
        return x;
      };
    };

    api.network = function (url) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
      var more = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : void 0;
      return network(method, url, more)();
    };

    /*
     * 以下定义网络接口
     * 定义网络接口时的原则：
     *   1. 无论后台返回的结构是否合适，都应当封装一层
     *   2. 封装时，意义相关的几个参数可以组成结构体，即便返回的结果是两个平级的参数
     *   3. 封装优先考虑语义，其次考虑与前端界面等逻辑的融洽性，最后考虑后台提供的接口格式
     *   4. 如果某个参数应当由后台提供，但需要前端根据其他参数计算，在封装的接口中计算，而非在外部控制器中计算
     *   5. 除非两处对同一个接口的需求几乎完全相同（如查看和修改），否则需要封装成两个不同的接口，不应共用一个
     *   6. 相关逻辑（一般也是同一页面）的接口写在一起，不同方面的接口分开书写
     *   7. 这里封装的接口无需与后台一一对应，可能后台一个接口被封装成多个，可能后台对接口的分组与此处不同
     */

    // collection: { id, type, name }
    // user: { id, role, name }
    // add(collection{id, type}, user{id, role})
    // add(collection{id, type}, Array<user{id, role}>)
    // modify(collection{id, type}, user{id, role})
    // delete(collection{id, type}, user{id})
    // get(collection{id, type}) => Array<user{id, role, name}>
    // getTypes() => Array<collection.type>
    // listByType(type) => Array<collection{id, type, name}>
    // myRole(collection{id, type}) => role; alias to api.user.myRole
    api.memberCollection = function () {
      var memberCollection = {};
      memberCollection.addOne = function (collection, user) {
        return network('POST', '/api/collection_members/single')({
          collectionId: collection.id,
          resourceType: collection.type,
          userId: user.id,
          role: user.role
        });
      };
      memberCollection.addMany = function (collection, userList) {
        return network('POST', '/api/collection_members/multiple')({
          collectionId: collection.id,
          resourceType: collection.type,
          members: (userList || []).map(function (_ref) {
            var id = _ref.id,
                role = _ref.role;
            return { userId: id, role: role };
          })
        });
      };
      memberCollection.add = function (collection, userObjOrList) {
        return angular.isArray(userObjOrList) ? api.memberCollection.addMany(collection, userObjOrList) : api.memberCollection.addOne(collection, userObjOrList);
      };
      memberCollection.modify = function (collection, user) {
        return network('PUT', '/api/collection_members/single')({
          collectionId: collection.id,
          resourceType: collection.type,
          userId: user.id,
          role: user.role
        });
      };
      memberCollection.delete = function (collection, user) {
        return network('DELETE', '/api/collection_members/' + collection.id + '/' + user.id + '/' + collection.type)();
      };
      memberCollection.get = function (collection) {
        return network('GET', '/api/collection_members/' + collection.id + '/' + collection.type)().then(function (response) {
          return (response || []).map(function (user) {
            return { id: user.userId, role: user.role, name: user.username };
          });
        });
      };
      memberCollection.getTypes = fake(constant(['PROJECT_COLLECTION', 'DEPLOY_COLLECTION', 'CLUSTER']));
      memberCollection.listByType = function (type) {
        return network('GET', '/api/collections/' + type)().then(function (response) {
          return (response || []).map(function (collection) {
            return { id: collection.id, type: type, name: collection.name, description: collection.description };
          });
        });
      };
      memberCollection.myRole = function (collection) {
        return api.user.myRole(collection);
      };
      return memberCollection;
    }();

    // user: {id, name, email, phone, loginType, createTime}
    // whoami() => user
    // list() => Array<user>
    // myRole(resource{type, id}) => role
    api.user = function () {
      var user = {};

      var readUser = function readUser(user) {
        return {
          id: user.id,
          name: user.username,
          email: user.email,
          phone: user.phone,
          loginType: user.loginType,
          createTime: new Date(user.createTime * 1000),
          isAdmin: 'adminPrivilege' in user ? !!user.adminPrivilege : null
        };
      };

      user.whoami = function () {
        return network('GET', '/api/user/get')().then(readUser);
      };
      user.list = function () {
        return network('GET', '/api/user/list')().then(function (response) {
          return (response || []).map(readUser);
        });
      };
      user.myRole = function (resource) {
        return network('GET', '/api/user/resource/' + resource.type + '/' + resource.id)();
      };
      // more api not added here, add them when you need some

      return user;
    }();

    api.image = function () {
      var image = {};

      // 共有镜像
      // image 摘要 { name, tagList.length, downloadCount, icon, createTime }
      // image 详情 { name, tagList, downloadCount, icon, createTime, readmeUrl, description, modifyTime }
      // list => image 摘要
      // detail({ name }) => image 详情
      image.public = function () {
        var _public = {};

        _public.list = function () {
          return network('GET', '/api/image/public/catalog')().then(function (response) {
            return (response || []).map(function (image) {
              return {
                name: image.imageName,
                tagList: Array(image.size),
                downloadCount: image.downloadCount,
                icon: image.iconUrl,
                updateTime: new Date(image.lastModified)
              };
            });
          });
        };

        _public.detail = function (image) {
          return network('GET', '/api/image/public/image?imageName=' + image.name)().then(function (response) {
            return {
              name: response.imageName,
              tagList: (response.tagInfos || []).map(function (tag) {
                return {
                  image: tag.imageName,
                  name: tag.imageTag,
                  size: tag.imageSize,
                  downloadCount: tag.downloadCount,
                  createTime: new Date(tag.createTime),
                  dockerfileUrl: tag.dockerfileUrl,
                  imageUrl: tag.imageUrl
                };
              }),
              downloadCount: response.downloadCount,
              icon: response.iconUrl,
              createTime: new Date(response.createTime),
              updateTime: new Date(response.lastModified),
              readmeUrl: response.readMeUrl,
              description: response.description
            };
          });
        };

        return _public;
      }();

      return image;
    }();

    api.overview = function () {
      var overview = {};
      overview.usage = function () {
        return network('GET', '/api/overview/usage')().then(function (data) {
          return {
            project: {
              collection: data.projectCollection,
              total: data.project
            },
            deploy: {
              collection: data.deployCollection,
              total: data.deployment
            },
            image: {
              total: data.image,
              base: data.imageBase,
              project: data.imageProject,
              other: data.imageOther
            },
            cluster: {
              total: data.cluster
            }
          };
        });
      };

      overview.resource = function () {
        return network('GET', '/api/overview/resource')().then(function (data) {
          return {
            memory: {
              total: data.memoryTotal,
              using: data.memoryUsed,
              free: data.memoryTotal - data.memoryUsed
            },
            cpu: {
              total: data.cpu0To25 + data.cpu25To50 + data.cpu50To75 + data.cpu75To100,
              load_0_25: data.cpu0To25,
              load_25_50: data.cpu25To50,
              load_50_75: data.cpu50To75,
              load_75_100: data.cpu75To100
            },
            disk: {
              total: data.diskTotal,
              using: data.diskTotal - data.diskRemain,
              free: data.diskRemain
            },
            node: {
              total: data.node,
              online: data.nodeOnline,
              offline: data.nodeOffline
            }
          };
        });
      };
      var actionUserFriendlyText = function actionUserFriendlyText(target, targetType, verb) {
        return {
          SET: '添加$',
          MODIFY: '修改$',
          DELETE: '删除$',
          BUILD: '构建$'
        }[verb].replace(/\$/, function () {
          return {
            PROJECT_COLLECTION: '项目$',
            PROJECT: '工程$',
            DEPLOY_COLLECTION: '服务$',
            DEPLOY: '部署$',
            STORAGE_CLUSTER: '存储$',
            STORAGE_VOLUME: '数据卷$'
          }[targetType].replace(/\$/, function () {
            return target;
          });
        });
      };
      overview.actionList = function () {
        return network('GET', '/api/overview/operation')().then(function (data) {
          return {
            actionList: data.map(function (item) {
              return {
                target: item.resourceName,
                targetType: item.resourceType,
                verb: item.operation,
                user: {
                  id: item.userId,
                  name: item.userName
                },
                time: new Date(item.operateTime),
                text: actionUserFriendlyText(item.resourceName, item.resourceType, item.operation)
              };
            })
          };
        });
      };
      var alarmUserFriendlyText = function alarmUserFriendlyText(metric, operator, targetValue, detectedValue) {
        return {
          cpu_percent: 'CPU使用率 <#> <r>%，为 <l>%',
          memory_percent: '内存使用率 <#> <r>%，为 <l>%',
          disk_percent: '磁盘使用率 <#> <r>%，为 <l>%',
          disk_read: '磁盘读取速率 <#> <r>KB/s，为 <l>KB/s',
          disk_write: '磁盘写入速率 <#> <r>KB/s，为 <l>KB/s',
          network_in: '网络流入速率 <#> <r>KB/s，为 <l>KB/s',
          network_out: '网络流出速率 <#> <r>KB/s，为 <l>KB/s',
          agent_alive: '监控代理未处于活动状态'
        }[metric].replace(/<#>/, function () {
          return {
            '==': '等于',
            '!=': '不等于',
            '<': '小于',
            '<=': '小于等于',
            '>': '大于',
            '>=': '大于等于'
          }[operator];
        }).replace(/<l>/, function () {
          return (detectedValue + '').slice(0, 4).replace(/\.$/, '');
        }).replace(/<r>/, function () {
          return (targetValue + '').slice(0, 4).replace(/\.$/, '');
        });
      };
      overview.alarmList = function () {
        return network('GET', '/api/alarm/event')().then(function (data) {
          return {
            alarmList: data.map(function (item) {
              return {
                time: new Date(item.timeStamp),
                text: alarmUserFriendlyText(item.metric, item.operator, item.rightValue, item.leftValue)
              };
            })
          };
        }, function () {
          return {
            // 当没有权限访问报警信息时，会返回 null 作为出错信息
            alarmList: null
          };
        });
      };
      overview.project = function () {
        return network('GET', '/api/overview/project')().then(function (data) {
          return {
            action: {
              build: {
                auto: data.autoBuild,
                manual: data.manualBuild
              }
            }
          };
        });
      };
      overview.deployment = function () {
        return network('GET', '/api/overview/deployment')().then(function (data) {
          return {
            action: {
              deploy: {
                auto: data.autoDeploy,
                online: data.onlineNumber
              }
            }
          };
        });
      };
      overview.id = function () {
        return network('GET', '/api/global/uuid')().then(function (id) {
          return { id: id };
        });
      };
      overview.version = function () {
        return network('GET', '/api/global/version')().then(function (version) {
          return { version: version };
        });
      };

      return overview;
    }();

    return api;
  }]);
})(window.backendApi = window.backendApi || angular.module('backendApi', []));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9iYWNrZW5kQXBpL2JhY2tlbmRBcGkuZXMiXSwibmFtZXMiOlsiYmFja2VuZEFwaSIsImZhY3RvcnkiLCIkaHR0cCIsIiR0aW1lb3V0IiwiYXBpIiwiZnJpZW5kbHlFcnJlck1lc3NhZ2UiLCJTaW1wbGVQcm9taXNlIiwicmVzb2x2ZXIiLCJzdGF0ZSIsInZhbHVlIiwiY2FsbGJhY2tzIiwic2VsZiIsIndhaXRpbmciLCJyZXNvbHZlIiwidiIsInRoZW4iLCJyZWplY3QiLCJlIiwic2V0VGltZW91dCIsImhhbmRsZUNhbGxiYWNrcyIsInJlYXNvbiIsInNoaWZ0Iiwib25GdWxsZmlsbGVkIiwib25SZWplY3RlZCIsImNhbGxiYWNrIiwibGVuZ3RoIiwicHJvbWlzZSIsInB1c2giLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsInByb3RvdHlwZSIsInRoYXQiLCJjYXRjaCIsImFsbCIsInByb21pc2VzIiwidmFsdWVzIiwiZG9uZSIsImZvckVhY2giLCJpbmRleCIsInJhY2UiLCJsb2FkU2NyaXB0IiwiY2FjaGUiLCJjcmVhdGUiLCJsb2FkZXIiLCJzcmMiLCJjaGVja2VyIiwiaW5pdGlhbCIsImxvYWREb25lIiwic2NyaXB0IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwidHlwZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJwYXJlbnQiLCJib2R5IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJhcHBlbmRDaGlsZCIsImhhc093blByb3BlcnR5IiwibmV0d29yayIsIm1ldGhvZCIsInVybCIsIm1vcmUiLCJkYXRhIiwiZGV0YWlscyIsImFyZ3MiLCJtZXJnZSIsImNvbnNvbGUiLCJsb2ciLCJoYW5kbGVSZXNwb25zZSIsInJlc3BvbnNlIiwic3VjY2VzcyIsInN0YXR1cyIsImxvY2F0aW9uIiwiaHJlZiIsInJlc3VsdCIsImVycm9yIiwiQXJyYXlCdWZmZXIiLCJyZXN1bHRDb2RlIiwicmVzdWx0TXNnIiwibXNnIiwid2FybiIsIkVycm9yIiwiZmFrZSIsImhhbmRsZXIiLCJleGNlcHRpb24iLCJhbmd1bGFyIiwiY29weSIsImNvbnN0YW50IiwieCIsIm1lbWJlckNvbGxlY3Rpb24iLCJhZGRPbmUiLCJjb2xsZWN0aW9uIiwidXNlciIsImNvbGxlY3Rpb25JZCIsImlkIiwicmVzb3VyY2VUeXBlIiwidXNlcklkIiwicm9sZSIsImFkZE1hbnkiLCJ1c2VyTGlzdCIsIm1lbWJlcnMiLCJtYXAiLCJhZGQiLCJ1c2VyT2JqT3JMaXN0IiwiaXNBcnJheSIsIm1vZGlmeSIsImRlbGV0ZSIsImdldCIsIm5hbWUiLCJ1c2VybmFtZSIsImdldFR5cGVzIiwibGlzdEJ5VHlwZSIsImRlc2NyaXB0aW9uIiwibXlSb2xlIiwicmVhZFVzZXIiLCJlbWFpbCIsInBob25lIiwibG9naW5UeXBlIiwiY3JlYXRlVGltZSIsIkRhdGUiLCJpc0FkbWluIiwiYWRtaW5Qcml2aWxlZ2UiLCJ3aG9hbWkiLCJsaXN0IiwicmVzb3VyY2UiLCJpbWFnZSIsInB1YmxpYyIsIl9wdWJsaWMiLCJpbWFnZU5hbWUiLCJ0YWdMaXN0IiwiQXJyYXkiLCJzaXplIiwiZG93bmxvYWRDb3VudCIsImljb24iLCJpY29uVXJsIiwidXBkYXRlVGltZSIsImxhc3RNb2RpZmllZCIsImRldGFpbCIsInRhZ0luZm9zIiwidGFnIiwiaW1hZ2VUYWciLCJpbWFnZVNpemUiLCJkb2NrZXJmaWxlVXJsIiwiaW1hZ2VVcmwiLCJyZWFkbWVVcmwiLCJyZWFkTWVVcmwiLCJvdmVydmlldyIsInVzYWdlIiwicHJvamVjdCIsInByb2plY3RDb2xsZWN0aW9uIiwidG90YWwiLCJkZXBsb3kiLCJkZXBsb3lDb2xsZWN0aW9uIiwiZGVwbG95bWVudCIsImJhc2UiLCJpbWFnZUJhc2UiLCJpbWFnZVByb2plY3QiLCJvdGhlciIsImltYWdlT3RoZXIiLCJjbHVzdGVyIiwibWVtb3J5IiwibWVtb3J5VG90YWwiLCJ1c2luZyIsIm1lbW9yeVVzZWQiLCJmcmVlIiwiY3B1IiwiY3B1MFRvMjUiLCJjcHUyNVRvNTAiLCJjcHU1MFRvNzUiLCJjcHU3NVRvMTAwIiwibG9hZF8wXzI1IiwibG9hZF8yNV81MCIsImxvYWRfNTBfNzUiLCJsb2FkXzc1XzEwMCIsImRpc2siLCJkaXNrVG90YWwiLCJkaXNrUmVtYWluIiwibm9kZSIsIm9ubGluZSIsIm5vZGVPbmxpbmUiLCJvZmZsaW5lIiwibm9kZU9mZmxpbmUiLCJhY3Rpb25Vc2VyRnJpZW5kbHlUZXh0IiwidGFyZ2V0IiwidGFyZ2V0VHlwZSIsInZlcmIiLCJTRVQiLCJNT0RJRlkiLCJERUxFVEUiLCJCVUlMRCIsInJlcGxhY2UiLCJQUk9KRUNUX0NPTExFQ1RJT04iLCJQUk9KRUNUIiwiREVQTE9ZX0NPTExFQ1RJT04iLCJERVBMT1kiLCJTVE9SQUdFX0NMVVNURVIiLCJTVE9SQUdFX1ZPTFVNRSIsImFjdGlvbkxpc3QiLCJpdGVtIiwicmVzb3VyY2VOYW1lIiwib3BlcmF0aW9uIiwidXNlck5hbWUiLCJ0aW1lIiwib3BlcmF0ZVRpbWUiLCJ0ZXh0IiwiYWxhcm1Vc2VyRnJpZW5kbHlUZXh0IiwibWV0cmljIiwib3BlcmF0b3IiLCJ0YXJnZXRWYWx1ZSIsImRldGVjdGVkVmFsdWUiLCJjcHVfcGVyY2VudCIsIm1lbW9yeV9wZXJjZW50IiwiZGlza19wZXJjZW50IiwiZGlza19yZWFkIiwiZGlza193cml0ZSIsIm5ldHdvcmtfaW4iLCJuZXR3b3JrX291dCIsImFnZW50X2FsaXZlIiwic2xpY2UiLCJhbGFybUxpc3QiLCJ0aW1lU3RhbXAiLCJyaWdodFZhbHVlIiwibGVmdFZhbHVlIiwiYWN0aW9uIiwiYnVpbGQiLCJhdXRvIiwiYXV0b0J1aWxkIiwibWFudWFsIiwibWFudWFsQnVpbGQiLCJhdXRvRGVwbG95Iiwib25saW5lTnVtYmVyIiwidmVyc2lvbiIsIndpbmRvdyIsIm1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsQ0FBRyxXQUFVQSxVQUFWLEVBQXNCO0FBQ3ZCOztBQUVBQSxhQUFXQyxP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QUFGLEVBQVo7QUFBQSxTQUE3QyxDQUFOO0FBQUEsT0FBcEI7O0FBRUEsYUFBT3JGLFFBQVA7QUFDRCxLQTVIZSxFQUFoQjs7QUE4SEEsV0FBT2pKLEdBQVA7QUFDRCxHQXZkeUIsQ0FBMUI7QUF3ZEQsQ0EzZEUsRUEyZER1TyxPQUFPM08sVUFBUCxHQUFvQjJPLE9BQU8zTyxVQUFQLElBQXFCd0YsUUFBUW9KLE1BQVIsQ0FBZSxZQUFmLEVBQTZCLEVBQTdCLENBM2R4QyxDQUFEIiwiZmlsZSI6ImNvbW1vbi9iYWNrZW5kQXBpL2JhY2tlbmRBcGkuanMiLCJzb3VyY2VzQ29udGVudCI6WyI7IChmdW5jdGlvbiAoYmFja2VuZEFwaSkge1xyXG4gIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICBiYWNrZW5kQXBpLmZhY3RvcnkoJ2FwaScsIFsnJGh0dHAnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJGh0dHAsICR0aW1lb3V0KSB7XHJcbiAgICBjb25zdCBhcGkgPSB7fTtcclxuXHJcbiAgICBjb25zdCBmcmllbmRseUVycmVyTWVzc2FnZSA9IHtcclxuICAgIH07XHJcblxyXG4gICAgLy8g5LiA5Liq566A5piT55qEIFByb21pc2VcclxuICAgIC8vIOS7v+eFp+WOn+eUn+eahOaOpeWPo++8iOWboOS4uuayoeacieeUqCBTeW1ib2wg77yM5omA5Lul5YW25a6e5Lmf5LiN5a6M5YWo5piv5Y6f55Sf55qE5o6l5Y+j77yJXHJcbiAgICAvLyDlm57osIPooqvljIXoo7nlnKggJHRpbWVvdXQg6YeM6Z2i77yM5Lul5L+d6K+B5Y+v5Lul6Kem5Y+RICRkaWdlc3Qg5ZGo5pyfXHJcbiAgICBhcGkuU2ltcGxlUHJvbWlzZSA9IGZ1bmN0aW9uIFNpbXBsZVByb21pc2UocmVzb2x2ZXIpIHtcclxuICAgICAgbGV0IHN0YXRlID0gbnVsbCwgdmFsdWUgPSBudWxsO1xyXG4gICAgICBsZXQgY2FsbGJhY2tzID0gW107XHJcbiAgICAgIGxldCBzZWxmID0gdGhpcywgd2FpdGluZyA9IG51bGw7XHJcbiAgICAgIGNvbnN0IHJlc29sdmUgPSAgZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBpZiAodiA9PT0gc2VsZikgdGhyb3cgJ3Byb21pc2Ugc2hvdWxkIG5vdCBiZSByZXNvbHZlIGJ5IGl0c2VsZic7XHJcbiAgICAgICAgaWYgKCh0eXBlb2YgdiA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHYgPT09ICdmdW5jdGlvbicpICYmIHYgJiZcclxuICAgICAgICAgICAgKCd0aGVuJyBpbiB2KSAmJiAodHlwZW9mIHYudGhlbiA9PT0gJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgICAgIHdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdi50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdGF0ZSA9IHRydWU7IHZhbHVlID0gdjtcclxuICAgICAgICAgIHNldFRpbWVvdXQoaGFuZGxlQ2FsbGJhY2tzLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IHJlamVjdCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgc3RhdGUgPSBmYWxzZTsgdmFsdWUgPSB2O1xyXG4gICAgICAgIHNldFRpbWVvdXQoaGFuZGxlQ2FsbGJhY2tzLCAwKTtcclxuICAgICAgfTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgIGlmIChzdGF0ZSAhPT0gbnVsbCB8fCB3YWl0aW5nICE9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcclxuICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgICAgICBpZiAoc3RhdGUgIT09IG51bGwgfHwgd2FpdGluZyAhPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgICAgcmVqZWN0KHJlYXNvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBpZiAoc3RhdGUgIT09IG51bGwgfHwgd2FpdGluZyAhPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIHN0YXRlID0gZmFsc2U7IHZhbHVlID0gZTtcclxuICAgICAgICBzZXRUaW1lb3V0KGhhbmRsZUNhbGxiYWNrcywgMCk7XHJcbiAgICAgIH1cclxuICAgICAgcmVzb2x2ZXIgPSBudWxsO1xyXG4gICAgICB2YXIgaGFuZGxlQ2FsbGJhY2tzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIHdoaWxlIChjYWxsYmFja3MubGVuZ3RoKSB7XHJcbiAgICAgICAgICBsZXQgeyBvbkZ1bGxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCB9ID0gY2FsbGJhY2tzLnNoaWZ0KCk7XHJcbiAgICAgICAgICBsZXQgY2FsbGJhY2sgPSBzdGF0ZSA/IG9uRnVsbGZpbGxlZCA6IG9uUmVqZWN0ZWQ7XHJcbiAgICAgICAgICBpZiAoIWNhbGxiYWNrIHx8IHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAoc3RhdGUgPyByZXNvbHZlIDogcmVqZWN0KSh2YWx1ZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdHJ5IHsgcmVzb2x2ZShjYWxsYmFjayh2YWx1ZSkpOyB9XHJcbiAgICAgICAgICAgICAgY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdmFyIHByb21pc2UgPSBmdW5jdGlvbiAob25GdWxsZmlsbGVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBjYWxsYmFja3MucHVzaCh7IG9uRnVsbGZpbGxlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0IH0pO1xyXG4gICAgICAgIHNldFRpbWVvdXQoaGFuZGxlQ2FsbGJhY2tzLCAwKTtcclxuICAgICAgfTtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdwcm9taXNlJywge1xyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgIHZhbHVlOiBwcm9taXNlXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGFwaS5TaW1wbGVQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsbGZpbGxlZCwgb25SZWplY3RlZCkge1xyXG4gICAgICBjb25zdCB0aGF0ID0gdGhpcztcclxuICAgICAgcmV0dXJuIG5ldyBhcGkuU2ltcGxlUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgdGhhdC5wcm9taXNlKG9uRnVsbGZpbGxlZCwgb25SZWplY3RlZCwgcmVzb2x2ZSwgcmVqZWN0KTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgYXBpLlNpbXBsZVByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcclxuICAgICAgY29uc3QgdGhhdCA9IHRoaXM7XHJcbiAgICAgIHJldHVybiBuZXcgYXBpLlNpbXBsZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIHRoYXQucHJvbWlzZSh2b2lkIDAsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgIH0pXHJcbiAgICB9O1xyXG4gICAgYXBpLlNpbXBsZVByb21pc2UuYWxsID0gZnVuY3Rpb24gKHByb21pc2VzKSB7XHJcbiAgICAgIHJldHVybiBuZXcgYXBpLlNpbXBsZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXSwgZG9uZSA9IDA7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIFsuLi5wcm9taXNlc10uZm9yRWFjaCgocHJvbWlzZSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgcHJvbWlzZS50aGVuKHZhbHVlID0+IHtcclxuICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWVcclxuICAgICAgICAgICAgICBpZiAoKytkb25lID09PSBwcm9taXNlcy5sZW5ndGgpIHJlc29sdmUodmFsdWVzKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2gocmVhc29uID0+IHtcclxuICAgICAgICAgICAgICByZWplY3QocmVhc29uKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGFwaS5TaW1wbGVQcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAocHJvbWlzZXMpIHtcclxuICAgICAgcmV0dXJuIG5ldyBhcGkuU2ltcGxlUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIFsuLi5wcm9taXNlc10uZm9yRWFjaChwcm9taXNlID0+IHByb21pc2UudGhlbihyZXNvbHZlKS5jYXRjaChyZWplY3QpKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgICBhcGkuU2ltcGxlUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XHJcbiAgICAgIHJldHVybiBuZXcgYXBpLlNpbXBsZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgICBhcGkuU2ltcGxlUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgIHJldHVybiBuZXcgYXBpLlNpbXBsZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8g5oeS5Yqg6L295p+Q5LiqIGpzIOaWh+S7tlxyXG4gICAgYXBpLmxvYWRTY3JpcHQgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zdCBjYWNoZSA9IE9iamVjdC5jcmVhdGUoe30pO1xyXG4gICAgICBsZXQgbG9hZGVyID0gZnVuY3Rpb24gKHNyYywgY2hlY2tlciwgaW5pdGlhbCkge1xyXG4gICAgICAgIGlmIChjaGVja2VyICYmIGNoZWNrZXIoKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGFwaS5TaW1wbGVQcm9taXNlLnJlc29sdmUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgYXBpLlNpbXBsZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgY29uc3QgbG9hZERvbmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoY2hlY2tlciA/IGNoZWNrZXIoKSA6IHRydWUpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGxldCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xyXG4gICAgICAgICAgc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5pdGlhbCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICAgIGFwaS5TaW1wbGVQcm9taXNlLnJlc29sdmUoaW5pdGlhbCgpKS50aGVuKGxvYWREb25lKTtcclxuICAgICAgICAgICAgfSBlbHNlIGxvYWREb25lKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XHJcbiAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzcmMsIGNoZWNrZXIsIGluaXRpYWwpIHtcclxuICAgICAgICBpZiAoIWNhY2hlLmhhc093blByb3BlcnR5KHNyYykpIHtcclxuICAgICAgICAgIGNhY2hlW3NyY10gPSBsb2FkZXIoc3JjLCBjaGVja2VyLCBpbml0aWFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNhY2hlW3NyY107XHJcbiAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIC8vIOeUqOadpeWumuS5ieS4gOS4que9kee7nOaOpeWPo1xyXG4gICAgY29uc3QgbmV0d29yayA9IGZ1bmN0aW9uKG1ldGhvZCwgdXJsLCBtb3JlKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhLCAuLi5kZXRhaWxzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBhcGkuU2ltcGxlUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgIGNvbnN0IGFyZ3MgPSBhbmd1bGFyLm1lcmdlKHt9LCB7IG1ldGhvZCwgdXJsIH0sIG1vcmUsIHsgZGF0YSB9LCAuLi5kZXRhaWxzKTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdbTkVUV09SS11bUkVRVUVTVF0gJXMgJXNcXG4lbycsIGFyZ3MubWV0aG9kLCBhcmdzLnVybCwgYXJncyk7XHJcbiAgICAgICAgICBjb25zdCBoYW5kbGVSZXNwb25zZSA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPCAyMDAgfHwgcmVzcG9uc2Uuc3RhdHVzID49IDMwMCkgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGxldCBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luL2xvZ2luLmh0bWwnO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGxldCByZXN1bHQgPSBudWxsLCBlcnJvciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHJlc3VsdCA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHJlc3VsdCA9IGRhdGE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgZGF0YSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKGRhdGEucmVzdWx0Q29kZSA9PT0gMjAwKSByZXN1bHQgPSBkYXRhLnJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgZWxzZSB7IHN1Y2Nlc3MgPSBmYWxzZTsgZXJyb3IgPSBkYXRhLnJlc3VsdE1zZzsgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tORVRXT1JLXVtSRVNQT05TRV0gJXMgJXNcXG4lbycsIGFyZ3MubWV0aG9kLCBhcmdzLnVybCwgcmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1zZyA9IGVycm9yIHx8ICfor7fmsYLlpITnkIbml7blj5HnlJ/plJnor68nO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1zZyBpbiBmcmllbmRseUVycmVyTWVzc2FnZSkgbXNnID0gZnJpZW5kbHlFcnJlck1lc3NhZ2VbbXNnXTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW05FVFdPUktdW0ZBSUxdICVzICVzXFxuJW8nLCBhcmdzLm1ldGhvZCwgYXJncy51cmwsIG1zZyk7XHJcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKG1zZykpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybignW05FVFdPUktdW0VYQ0VQVElPTl0gJXMgJXNcXG4lbycsIGFyZ3MubWV0aG9kLCBhcmdzLnVybCwgZSk7XHJcbiAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignJykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkaHR0cChhcmdzKS50aGVuKGhhbmRsZVJlc3BvbnNlLCBoYW5kbGVSZXNwb25zZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyDnlKjmnaXlrprkuYnkuIDkuKrmnKzlnLDorqHnrpfnmoTmlbDmja5cclxuICAgIGNvbnN0IGZha2UgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmRldGFpbHMpIHtcclxuICAgICAgICBsZXQgcmVzdWx0LCBleGNlcHRpb24sIHN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIHRyeSB7IHJlc3VsdCA9IGhhbmRsZXIoLi4uZGV0YWlscyk7IH1cclxuICAgICAgICBjYXRjaCAoZSkgeyBleGNlcHRpb24gPSBlOyBzdWNjZXNzID0gZmFsc2U7IH1cclxuICAgICAgICBpZiAoc3VjY2VzcykgcmV0dXJuIGFwaS5TaW1wbGVQcm9taXNlLnJlc29sdmUoYW5ndWxhci5jb3B5KHJlc3VsdCkpO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGFwaS5TaW1wbGVQcm9taXNlLnJlamVjdChhbmd1bGFyLmNvcHkoZXhjZXB0aW9uKSk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgY29uc3QgY29uc3RhbnQgPSAoeCkgPT4gKCkgPT4geDtcclxuXHJcbiAgICBhcGkubmV0d29yayA9ICh1cmwsIG1ldGhvZCA9ICdHRVQnLCBtb3JlID0gKHZvaWQgMCkpID0+IG5ldHdvcmsobWV0aG9kLCB1cmwsIG1vcmUpKCk7XHJcblxyXG4gICAgLypcclxuICAgICAqIOS7peS4i+WumuS5iee9kee7nOaOpeWPo1xyXG4gICAgICog5a6a5LmJ572R57uc5o6l5Y+j5pe255qE5Y6f5YiZ77yaXHJcbiAgICAgKiAgIDEuIOaXoOiuuuWQjuWPsOi/lOWbnueahOe7k+aehOaYr+WQpuWQiOmAgu+8jOmDveW6lOW9k+WwgeijheS4gOWxglxyXG4gICAgICogICAyLiDlsIHoo4Xml7bvvIzmhI/kuYnnm7jlhbPnmoTlh6DkuKrlj4LmlbDlj6/ku6Xnu4TmiJDnu5PmnoTkvZPvvIzljbPkvr/ov5Tlm57nmoTnu5PmnpzmmK/kuKTkuKrlubPnuqfnmoTlj4LmlbBcclxuICAgICAqICAgMy4g5bCB6KOF5LyY5YWI6ICD6JmR6K+t5LmJ77yM5YW25qyh6ICD6JmR5LiO5YmN56uv55WM6Z2i562J6YC76L6R55qE6J6N5rS95oCn77yM5pyA5ZCO6ICD6JmR5ZCO5Y+w5o+Q5L6b55qE5o6l5Y+j5qC85byPXHJcbiAgICAgKiAgIDQuIOWmguaenOafkOS4quWPguaVsOW6lOW9k+eUseWQjuWPsOaPkOS+m++8jOS9humcgOimgeWJjeerr+agueaNruWFtuS7luWPguaVsOiuoeeul++8jOWcqOWwgeijheeahOaOpeWPo+S4reiuoeeul++8jOiAjOmdnuWcqOWklumDqOaOp+WItuWZqOS4reiuoeeul1xyXG4gICAgICogICA1LiDpmaTpnZ7kuKTlpITlr7nlkIzkuIDkuKrmjqXlj6PnmoTpnIDmsYLlh6DkuY7lrozlhajnm7jlkIzvvIjlpoLmn6XnnIvlkozkv67mlLnvvInvvIzlkKbliJnpnIDopoHlsIHoo4XmiJDkuKTkuKrkuI3lkIznmoTmjqXlj6PvvIzkuI3lupTlhbHnlKjkuIDkuKpcclxuICAgICAqICAgNi4g55u45YWz6YC76L6R77yI5LiA6Iis5Lmf5piv5ZCM5LiA6aG16Z2i77yJ55qE5o6l5Y+j5YaZ5Zyo5LiA6LW377yM5LiN5ZCM5pa56Z2i55qE5o6l5Y+j5YiG5byA5Lmm5YaZXHJcbiAgICAgKiAgIDcuIOi/memHjOWwgeijheeahOaOpeWPo+aXoOmcgOS4juWQjuWPsOS4gOS4gOWvueW6lO+8jOWPr+iDveWQjuWPsOS4gOS4quaOpeWPo+iiq+WwgeijheaIkOWkmuS4qu+8jOWPr+iDveWQjuWPsOWvueaOpeWPo+eahOWIhue7hOS4juatpOWkhOS4jeWQjFxyXG4gICAgICovXHJcblxyXG4gICAgLy8gY29sbGVjdGlvbjogeyBpZCwgdHlwZSwgbmFtZSB9XHJcbiAgICAvLyB1c2VyOiB7IGlkLCByb2xlLCBuYW1lIH1cclxuICAgIC8vIGFkZChjb2xsZWN0aW9ue2lkLCB0eXBlfSwgdXNlcntpZCwgcm9sZX0pXHJcbiAgICAvLyBhZGQoY29sbGVjdGlvbntpZCwgdHlwZX0sIEFycmF5PHVzZXJ7aWQsIHJvbGV9PilcclxuICAgIC8vIG1vZGlmeShjb2xsZWN0aW9ue2lkLCB0eXBlfSwgdXNlcntpZCwgcm9sZX0pXHJcbiAgICAvLyBkZWxldGUoY29sbGVjdGlvbntpZCwgdHlwZX0sIHVzZXJ7aWR9KVxyXG4gICAgLy8gZ2V0KGNvbGxlY3Rpb257aWQsIHR5cGV9KSA9PiBBcnJheTx1c2Vye2lkLCByb2xlLCBuYW1lfT5cclxuICAgIC8vIGdldFR5cGVzKCkgPT4gQXJyYXk8Y29sbGVjdGlvbi50eXBlPlxyXG4gICAgLy8gbGlzdEJ5VHlwZSh0eXBlKSA9PiBBcnJheTxjb2xsZWN0aW9ue2lkLCB0eXBlLCBuYW1lfT5cclxuICAgIC8vIG15Um9sZShjb2xsZWN0aW9ue2lkLCB0eXBlfSkgPT4gcm9sZTsgYWxpYXMgdG8gYXBpLnVzZXIubXlSb2xlXHJcbiAgICBhcGkubWVtYmVyQ29sbGVjdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNvbnN0IG1lbWJlckNvbGxlY3Rpb24gPSB7fTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5hZGRPbmUgPSAoKGNvbGxlY3Rpb24sIHVzZXIpID0+XHJcbiAgICAgICAgbmV0d29yaygnUE9TVCcsICcvYXBpL2NvbGxlY3Rpb25fbWVtYmVycy9zaW5nbGUnKSh7XHJcbiAgICAgICAgICBjb2xsZWN0aW9uSWQ6IGNvbGxlY3Rpb24uaWQsXHJcbiAgICAgICAgICByZXNvdXJjZVR5cGU6IGNvbGxlY3Rpb24udHlwZSxcclxuICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcclxuICAgICAgICAgIHJvbGU6IHVzZXIucm9sZVxyXG4gICAgICAgIH0pKTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5hZGRNYW55ID0gKChjb2xsZWN0aW9uLCB1c2VyTGlzdCkgPT5cclxuICAgICAgICBuZXR3b3JrKCdQT1NUJywgJy9hcGkvY29sbGVjdGlvbl9tZW1iZXJzL211bHRpcGxlJykoe1xyXG4gICAgICAgICAgY29sbGVjdGlvbklkOiBjb2xsZWN0aW9uLmlkLFxyXG4gICAgICAgICAgcmVzb3VyY2VUeXBlOiBjb2xsZWN0aW9uLnR5cGUsXHJcbiAgICAgICAgICBtZW1iZXJzOiAodXNlckxpc3QgfHwgW10pLm1hcCgoe2lkLCByb2xlfSkgPT4gKHsgdXNlcklkOiBpZCwgcm9sZTogcm9sZSB9KSlcclxuICAgICAgICB9KSk7XHJcbiAgICAgIG1lbWJlckNvbGxlY3Rpb24uYWRkID0gKChjb2xsZWN0aW9uLCB1c2VyT2JqT3JMaXN0KSA9PlxyXG4gICAgICAgIGFuZ3VsYXIuaXNBcnJheSh1c2VyT2JqT3JMaXN0KSA/XHJcbiAgICAgICAgICBhcGkubWVtYmVyQ29sbGVjdGlvbi5hZGRNYW55KGNvbGxlY3Rpb24sIHVzZXJPYmpPckxpc3QpIDpcclxuICAgICAgICAgIGFwaS5tZW1iZXJDb2xsZWN0aW9uLmFkZE9uZShjb2xsZWN0aW9uLCB1c2VyT2JqT3JMaXN0KSk7XHJcbiAgICAgIG1lbWJlckNvbGxlY3Rpb24ubW9kaWZ5ID0gKChjb2xsZWN0aW9uLCB1c2VyKSA9PlxyXG4gICAgICAgIG5ldHdvcmsoJ1BVVCcsICcvYXBpL2NvbGxlY3Rpb25fbWVtYmVycy9zaW5nbGUnKSh7XHJcbiAgICAgICAgICBjb2xsZWN0aW9uSWQ6IGNvbGxlY3Rpb24uaWQsXHJcbiAgICAgICAgICByZXNvdXJjZVR5cGU6IGNvbGxlY3Rpb24udHlwZSxcclxuICAgICAgICAgIHVzZXJJZDogdXNlci5pZCxcclxuICAgICAgICAgIHJvbGU6IHVzZXIucm9sZVxyXG4gICAgICAgIH0pKTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5kZWxldGUgPSAoKGNvbGxlY3Rpb24sIHVzZXIpID0+XHJcbiAgICAgICAgbmV0d29yaygnREVMRVRFJywgYC9hcGkvY29sbGVjdGlvbl9tZW1iZXJzLyR7Y29sbGVjdGlvbi5pZH0vJHt1c2VyLmlkfS8ke2NvbGxlY3Rpb24udHlwZX1gKSgpKTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5nZXQgPSAoKGNvbGxlY3Rpb24pID0+XHJcbiAgICAgICAgbmV0d29yaygnR0VUJywgYC9hcGkvY29sbGVjdGlvbl9tZW1iZXJzLyR7Y29sbGVjdGlvbi5pZH0vJHtjb2xsZWN0aW9uLnR5cGV9YCkoKVxyXG4gICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gKHJlc3BvbnNlIHx8IFtdKS5tYXAodXNlciA9PiAoeyBpZDogdXNlci51c2VySWQsIHJvbGU6IHVzZXIucm9sZSwgbmFtZTogdXNlci51c2VybmFtZSB9KSkpKTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5nZXRUeXBlcyA9IChmYWtlKGNvbnN0YW50KFtcclxuICAgICAgICAnUFJPSkVDVF9DT0xMRUNUSU9OJyxcclxuICAgICAgICAnREVQTE9ZX0NPTExFQ1RJT04nLFxyXG4gICAgICAgICdDTFVTVEVSJyxcclxuICAgICAgXSkpKTtcclxuICAgICAgbWVtYmVyQ29sbGVjdGlvbi5saXN0QnlUeXBlID0gKCh0eXBlKSA9PlxyXG4gICAgICAgIG5ldHdvcmsoJ0dFVCcsIGAvYXBpL2NvbGxlY3Rpb25zLyR7dHlwZX1gKSgpXHJcbiAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiAocmVzcG9uc2UgfHwgW10pLm1hcChjb2xsZWN0aW9uID0+ICh7IGlkOiBjb2xsZWN0aW9uLmlkLCB0eXBlOiB0eXBlLCBuYW1lOiBjb2xsZWN0aW9uLm5hbWUsIGRlc2NyaXB0aW9uOiBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uIH0pKSkpO1xyXG4gICAgICBtZW1iZXJDb2xsZWN0aW9uLm15Um9sZSA9ICgoY29sbGVjdGlvbikgPT4gYXBpLnVzZXIubXlSb2xlKGNvbGxlY3Rpb24pKTtcclxuICAgICAgcmV0dXJuIG1lbWJlckNvbGxlY3Rpb247XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIC8vIHVzZXI6IHtpZCwgbmFtZSwgZW1haWwsIHBob25lLCBsb2dpblR5cGUsIGNyZWF0ZVRpbWV9XHJcbiAgICAvLyB3aG9hbWkoKSA9PiB1c2VyXHJcbiAgICAvLyBsaXN0KCkgPT4gQXJyYXk8dXNlcj5cclxuICAgIC8vIG15Um9sZShyZXNvdXJjZXt0eXBlLCBpZH0pID0+IHJvbGVcclxuICAgIGFwaS51c2VyID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29uc3QgdXNlciA9IHt9O1xyXG5cclxuICAgICAgY29uc3QgcmVhZFVzZXIgPSB1c2VyID0+ICh7XHJcbiAgICAgICAgaWQ6IHVzZXIuaWQsXHJcbiAgICAgICAgbmFtZTogdXNlci51c2VybmFtZSxcclxuICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcclxuICAgICAgICBwaG9uZTogdXNlci5waG9uZSxcclxuICAgICAgICBsb2dpblR5cGU6IHVzZXIubG9naW5UeXBlLFxyXG4gICAgICAgIGNyZWF0ZVRpbWU6IG5ldyBEYXRlKHVzZXIuY3JlYXRlVGltZSAqIDEwMDApLFxyXG4gICAgICAgIGlzQWRtaW46ICdhZG1pblByaXZpbGVnZScgaW4gdXNlciA/ICEhdXNlci5hZG1pblByaXZpbGVnZSA6IG51bGwsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdXNlci53aG9hbWkgPSAoKCkgPT4gbmV0d29yaygnR0VUJywgJy9hcGkvdXNlci9nZXQnKSgpLnRoZW4ocmVhZFVzZXIpKTtcclxuICAgICAgdXNlci5saXN0ID0gKCgpID0+IG5ldHdvcmsoJ0dFVCcsICcvYXBpL3VzZXIvbGlzdCcpKCkudGhlbihyZXNwb25zZSA9PiAocmVzcG9uc2UgfHwgW10pLm1hcChyZWFkVXNlcikpKTtcclxuICAgICAgdXNlci5teVJvbGUgPSAoKHJlc291cmNlKSA9PiBuZXR3b3JrKCdHRVQnLCBgL2FwaS91c2VyL3Jlc291cmNlLyR7cmVzb3VyY2UudHlwZX0vJHtyZXNvdXJjZS5pZH1gKSgpKTtcclxuICAgICAgLy8gbW9yZSBhcGkgbm90IGFkZGVkIGhlcmUsIGFkZCB0aGVtIHdoZW4geW91IG5lZWQgc29tZVxyXG5cclxuICAgICAgcmV0dXJuIHVzZXI7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGFwaS5pbWFnZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNvbnN0IGltYWdlID0ge307XHJcblxyXG4gICAgICAvLyDlhbHmnInplZzlg49cclxuICAgICAgLy8gaW1hZ2Ug5pGY6KaBIHsgbmFtZSwgdGFnTGlzdC5sZW5ndGgsIGRvd25sb2FkQ291bnQsIGljb24sIGNyZWF0ZVRpbWUgfVxyXG4gICAgICAvLyBpbWFnZSDor6bmg4UgeyBuYW1lLCB0YWdMaXN0LCBkb3dubG9hZENvdW50LCBpY29uLCBjcmVhdGVUaW1lLCByZWFkbWVVcmwsIGRlc2NyaXB0aW9uLCBtb2RpZnlUaW1lIH1cclxuICAgICAgLy8gbGlzdCA9PiBpbWFnZSDmkZjopoFcclxuICAgICAgLy8gZGV0YWlsKHsgbmFtZSB9KSA9PiBpbWFnZSDor6bmg4VcclxuICAgICAgaW1hZ2UucHVibGljID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBjb25zdCBfcHVibGljID0ge307XHJcblxyXG4gICAgICAgIF9wdWJsaWMubGlzdCA9ICgpID0+IG5ldHdvcmsoJ0dFVCcsICcvYXBpL2ltYWdlL3B1YmxpYy9jYXRhbG9nJykoKVxyXG4gICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gKHJlc3BvbnNlIHx8IFtdKS5tYXAoaW1hZ2UgPT4gKHtcclxuICAgICAgICAgICAgbmFtZTogaW1hZ2UuaW1hZ2VOYW1lLFxyXG4gICAgICAgICAgICB0YWdMaXN0OiBBcnJheShpbWFnZS5zaXplKSxcclxuICAgICAgICAgICAgZG93bmxvYWRDb3VudDogaW1hZ2UuZG93bmxvYWRDb3VudCxcclxuICAgICAgICAgICAgaWNvbjogaW1hZ2UuaWNvblVybCxcclxuICAgICAgICAgICAgdXBkYXRlVGltZTogbmV3IERhdGUoaW1hZ2UubGFzdE1vZGlmaWVkKSxcclxuICAgICAgICAgIH0pKSk7XHJcblxyXG4gICAgICAgIF9wdWJsaWMuZGV0YWlsID0gKGltYWdlKSA9PiBuZXR3b3JrKCdHRVQnLCBgL2FwaS9pbWFnZS9wdWJsaWMvaW1hZ2U/aW1hZ2VOYW1lPSR7aW1hZ2UubmFtZX1gKSgpXHJcbiAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiAoe1xyXG4gICAgICAgICAgICBuYW1lOiByZXNwb25zZS5pbWFnZU5hbWUsXHJcbiAgICAgICAgICAgIHRhZ0xpc3Q6IChyZXNwb25zZS50YWdJbmZvcyB8fCBbXSkubWFwKHRhZyA9PiAoe1xyXG4gICAgICAgICAgICAgIGltYWdlOiB0YWcuaW1hZ2VOYW1lLFxyXG4gICAgICAgICAgICAgIG5hbWU6IHRhZy5pbWFnZVRhZyxcclxuICAgICAgICAgICAgICBzaXplOiB0YWcuaW1hZ2VTaXplLFxyXG4gICAgICAgICAgICAgIGRvd25sb2FkQ291bnQ6IHRhZy5kb3dubG9hZENvdW50LFxyXG4gICAgICAgICAgICAgIGNyZWF0ZVRpbWU6IG5ldyBEYXRlKHRhZy5jcmVhdGVUaW1lKSxcclxuICAgICAgICAgICAgICBkb2NrZXJmaWxlVXJsOiB0YWcuZG9ja2VyZmlsZVVybCxcclxuICAgICAgICAgICAgICBpbWFnZVVybDogdGFnLmltYWdlVXJsLFxyXG4gICAgICAgICAgICB9KSksXHJcbiAgICAgICAgICAgIGRvd25sb2FkQ291bnQ6IHJlc3BvbnNlLmRvd25sb2FkQ291bnQsXHJcbiAgICAgICAgICAgIGljb246IHJlc3BvbnNlLmljb25VcmwsXHJcbiAgICAgICAgICAgIGNyZWF0ZVRpbWU6IG5ldyBEYXRlKHJlc3BvbnNlLmNyZWF0ZVRpbWUpLFxyXG4gICAgICAgICAgICB1cGRhdGVUaW1lOiBuZXcgRGF0ZShyZXNwb25zZS5sYXN0TW9kaWZpZWQpLFxyXG4gICAgICAgICAgICByZWFkbWVVcmw6IHJlc3BvbnNlLnJlYWRNZVVybCxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlc3BvbnNlLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICByZXR1cm4gX3B1YmxpYztcclxuICAgICAgfSgpKTtcclxuXHJcbiAgICAgIHJldHVybiBpbWFnZTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgYXBpLm92ZXJ2aWV3ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29uc3Qgb3ZlcnZpZXcgPSB7fTtcclxuICAgICAgb3ZlcnZpZXcudXNhZ2UgPSAoKCkgPT4gbmV0d29yaygnR0VUJywgJy9hcGkvb3ZlcnZpZXcvdXNhZ2UnKSgpLnRoZW4oZGF0YSA9PiAoe1xyXG4gICAgICAgIHByb2plY3Q6IHtcclxuICAgICAgICAgIGNvbGxlY3Rpb246IGRhdGEucHJvamVjdENvbGxlY3Rpb24sXHJcbiAgICAgICAgICB0b3RhbDogZGF0YS5wcm9qZWN0LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVwbG95OiB7XHJcbiAgICAgICAgICBjb2xsZWN0aW9uOiBkYXRhLmRlcGxveUNvbGxlY3Rpb24sXHJcbiAgICAgICAgICB0b3RhbDogZGF0YS5kZXBsb3ltZW50LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW1hZ2U6IHtcclxuICAgICAgICAgIHRvdGFsOiBkYXRhLmltYWdlLFxyXG4gICAgICAgICAgYmFzZTogZGF0YS5pbWFnZUJhc2UsXHJcbiAgICAgICAgICBwcm9qZWN0OiBkYXRhLmltYWdlUHJvamVjdCxcclxuICAgICAgICAgIG90aGVyOiBkYXRhLmltYWdlT3RoZXIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjbHVzdGVyOiB7XHJcbiAgICAgICAgICB0b3RhbDogZGF0YS5jbHVzdGVyLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pKSk7XHJcblxyXG4gICAgICBvdmVydmlldy5yZXNvdXJjZSA9ICgoKSA9PiBuZXR3b3JrKCdHRVQnLCAnL2FwaS9vdmVydmlldy9yZXNvdXJjZScpKCkudGhlbihkYXRhID0+ICh7XHJcbiAgICAgICAgICBtZW1vcnk6IHtcclxuICAgICAgICAgICAgdG90YWw6IGRhdGEubWVtb3J5VG90YWwsXHJcbiAgICAgICAgICAgIHVzaW5nOiBkYXRhLm1lbW9yeVVzZWQsXHJcbiAgICAgICAgICAgIGZyZWU6IGRhdGEubWVtb3J5VG90YWwgLSBkYXRhLm1lbW9yeVVzZWQsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgY3B1OiB7XHJcbiAgICAgICAgICAgIHRvdGFsOiBkYXRhLmNwdTBUbzI1ICsgZGF0YS5jcHUyNVRvNTAgKyBkYXRhLmNwdTUwVG83NSArIGRhdGEuY3B1NzVUbzEwMCxcclxuICAgICAgICAgICAgbG9hZF8wXzI1OiBkYXRhLmNwdTBUbzI1LFxyXG4gICAgICAgICAgICBsb2FkXzI1XzUwOiBkYXRhLmNwdTI1VG81MCxcclxuICAgICAgICAgICAgbG9hZF81MF83NTogZGF0YS5jcHU1MFRvNzUsXHJcbiAgICAgICAgICAgIGxvYWRfNzVfMTAwOiBkYXRhLmNwdTc1VG8xMDAsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZGlzazoge1xyXG4gICAgICAgICAgICB0b3RhbDogZGF0YS5kaXNrVG90YWwsXHJcbiAgICAgICAgICAgIHVzaW5nOiBkYXRhLmRpc2tUb3RhbCAtIGRhdGEuZGlza1JlbWFpbixcclxuICAgICAgICAgICAgZnJlZTogZGF0YS5kaXNrUmVtYWluLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIG5vZGU6IHtcclxuICAgICAgICAgICAgdG90YWw6IGRhdGEubm9kZSxcclxuICAgICAgICAgICAgb25saW5lOiBkYXRhLm5vZGVPbmxpbmUsXHJcbiAgICAgICAgICAgIG9mZmxpbmU6IGRhdGEubm9kZU9mZmxpbmVcclxuICAgICAgICAgIH1cclxuICAgICAgfSkpKTtcclxuICAgICAgY29uc3QgYWN0aW9uVXNlckZyaWVuZGx5VGV4dCA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldFR5cGUsIHZlcmIpIHtcclxuICAgICAgICByZXR1cm4gKHtcclxuICAgICAgICAgIFNFVDogJ+a3u+WKoCQnLFxyXG4gICAgICAgICAgTU9ESUZZOiAn5L+u5pS5JCcsXHJcbiAgICAgICAgICBERUxFVEU6ICfliKDpmaQkJyxcclxuICAgICAgICAgIEJVSUxEOiAn5p6E5bu6JCcsXHJcbiAgICAgICAgfVt2ZXJiXSkucmVwbGFjZSgvXFwkLywgKCkgPT4gKHtcclxuICAgICAgICAgIFBST0pFQ1RfQ09MTEVDVElPTjogJ+mhueebriQnLFxyXG4gICAgICAgICAgUFJPSkVDVDogJ+W3peeoiyQnLFxyXG4gICAgICAgICAgREVQTE9ZX0NPTExFQ1RJT046ICfmnI3liqEkJyxcclxuICAgICAgICAgIERFUExPWTogJ+mDqOe9siQnLFxyXG4gICAgICAgICAgU1RPUkFHRV9DTFVTVEVSOiAn5a2Y5YKoJCcsXHJcbiAgICAgICAgICBTVE9SQUdFX1ZPTFVNRTogJ+aVsOaNruWNtyQnLFxyXG4gICAgICAgIH1bdGFyZ2V0VHlwZV0pLnJlcGxhY2UoL1xcJC8sICgpID0+IHRhcmdldCkpO1xyXG4gICAgICB9O1xyXG4gICAgICBvdmVydmlldy5hY3Rpb25MaXN0ID0gICgoKSA9PiBuZXR3b3JrKCdHRVQnLCAnL2FwaS9vdmVydmlldy9vcGVyYXRpb24nKSgpLnRoZW4oZGF0YSA9PiAoe1xyXG4gICAgICAgIGFjdGlvbkxpc3Q6IGRhdGEubWFwKGl0ZW0gPT4gKHtcclxuICAgICAgICAgIHRhcmdldDogaXRlbS5yZXNvdXJjZU5hbWUsXHJcbiAgICAgICAgICB0YXJnZXRUeXBlOiBpdGVtLnJlc291cmNlVHlwZSxcclxuICAgICAgICAgIHZlcmI6IGl0ZW0ub3BlcmF0aW9uLFxyXG4gICAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgICBpZDogaXRlbS51c2VySWQsXHJcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlck5hbWUsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdGltZTogbmV3IERhdGUoaXRlbS5vcGVyYXRlVGltZSksXHJcbiAgICAgICAgICB0ZXh0OiBhY3Rpb25Vc2VyRnJpZW5kbHlUZXh0KGl0ZW0ucmVzb3VyY2VOYW1lLCBpdGVtLnJlc291cmNlVHlwZSwgaXRlbS5vcGVyYXRpb24pLFxyXG4gICAgICAgIH0pKSxcclxuICAgICAgfSkpKTtcclxuICAgICAgY29uc3QgYWxhcm1Vc2VyRnJpZW5kbHlUZXh0ID0gZnVuY3Rpb24gKG1ldHJpYywgb3BlcmF0b3IsIHRhcmdldFZhbHVlLCBkZXRlY3RlZFZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuICh7XHJcbiAgICAgICAgICBjcHVfcGVyY2VudDogJ0NQVeS9v+eUqOeOhyA8Iz4gPHI+Je+8jOS4uiA8bD4lJyxcclxuICAgICAgICAgIG1lbW9yeV9wZXJjZW50OiAn5YaF5a2Y5L2/55So546HIDwjPiA8cj4l77yM5Li6IDxsPiUnLFxyXG4gICAgICAgICAgZGlza19wZXJjZW50OiAn56OB55uY5L2/55So546HIDwjPiA8cj4l77yM5Li6IDxsPiUnLFxyXG4gICAgICAgICAgZGlza19yZWFkOiAn56OB55uY6K+75Y+W6YCf546HIDwjPiA8cj5LQi9z77yM5Li6IDxsPktCL3MnLFxyXG4gICAgICAgICAgZGlza193cml0ZTogJ+ejgeebmOWGmeWFpemAn+eOhyA8Iz4gPHI+S0Ivc++8jOS4uiA8bD5LQi9zJyxcclxuICAgICAgICAgIG5ldHdvcmtfaW46ICfnvZHnu5zmtYHlhaXpgJ/njocgPCM+IDxyPktCL3PvvIzkuLogPGw+S0IvcycsXHJcbiAgICAgICAgICBuZXR3b3JrX291dDogJ+e9kee7nOa1geWHuumAn+eOhyA8Iz4gPHI+S0Ivc++8jOS4uiA8bD5LQi9zJyxcclxuICAgICAgICAgIGFnZW50X2FsaXZlOiAn55uR5o6n5Luj55CG5pyq5aSE5LqO5rS75Yqo54q25oCBJyxcclxuICAgICAgICB9W21ldHJpY10ucmVwbGFjZSgvPCM+LywgKCkgPT4gKHtcclxuICAgICAgICAgICc9PSc6ICfnrYnkuo4nLFxyXG4gICAgICAgICAgJyE9JzogJ+S4jeetieS6jicsXHJcbiAgICAgICAgICAnPCcgOiAn5bCP5LqOJyxcclxuICAgICAgICAgICc8PSc6ICflsI/kuo7nrYnkuo4nLFxyXG4gICAgICAgICAgJz4nIDogJ+Wkp+S6jicsXHJcbiAgICAgICAgICAnPj0nOiAn5aSn5LqO562J5LqOJ1xyXG4gICAgICAgIH1bb3BlcmF0b3JdKSlcclxuICAgICAgICAgIC5yZXBsYWNlKC88bD4vLCAoKSA9PiAoZGV0ZWN0ZWRWYWx1ZSArICcnKS5zbGljZSgwLCA0KS5yZXBsYWNlKC9cXC4kLywgJycpKVxyXG4gICAgICAgICAgLnJlcGxhY2UoLzxyPi8sICgpID0+ICh0YXJnZXRWYWx1ZSArICcnKS5zbGljZSgwLCA0KS5yZXBsYWNlKC9cXC4kLywgJycpKSk7XHJcbiAgICAgIH07XHJcbiAgICAgIG92ZXJ2aWV3LmFsYXJtTGlzdCA9ICgoKSA9PiBuZXR3b3JrKCdHRVQnLCAnL2FwaS9hbGFybS9ldmVudCcpKCkudGhlbihkYXRhID0+ICh7XHJcbiAgICAgICAgYWxhcm1MaXN0OiBkYXRhLm1hcChpdGVtID0+ICh7XHJcbiAgICAgICAgICB0aW1lOiBuZXcgRGF0ZShpdGVtLnRpbWVTdGFtcCksXHJcbiAgICAgICAgICB0ZXh0OiBhbGFybVVzZXJGcmllbmRseVRleHQoaXRlbS5tZXRyaWMsIGl0ZW0ub3BlcmF0b3IsIGl0ZW0ucmlnaHRWYWx1ZSwgaXRlbS5sZWZ0VmFsdWUpXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIH0pLCAoKSA9PiAoe1xyXG4gICAgICAgIC8vIOW9k+ayoeacieadg+mZkOiuv+mXruaKpeitpuS/oeaBr+aXtu+8jOS8mui/lOWbniBudWxsIOS9nOS4uuWHuumUmeS/oeaBr1xyXG4gICAgICAgIGFsYXJtTGlzdDogbnVsbCxcclxuICAgICAgfSkpKTtcclxuICAgICAgb3ZlcnZpZXcucHJvamVjdCA9ICgoKSA9PiBuZXR3b3JrKCdHRVQnLCAnL2FwaS9vdmVydmlldy9wcm9qZWN0JykoKS50aGVuKGRhdGEgPT4gKHtcclxuICAgICAgICBhY3Rpb246IHtcclxuICAgICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIGF1dG86IGRhdGEuYXV0b0J1aWxkLFxyXG4gICAgICAgICAgICBtYW51YWw6IGRhdGEubWFudWFsQnVpbGQsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KSkpO1xyXG4gICAgICBvdmVydmlldy5kZXBsb3ltZW50ID0gKCgpID0+IG5ldHdvcmsoJ0dFVCcsICcvYXBpL292ZXJ2aWV3L2RlcGxveW1lbnQnKSgpLnRoZW4oZGF0YSA9PiAoe1xyXG4gICAgICAgIGFjdGlvbjoge1xyXG4gICAgICAgICAgZGVwbG95OiB7XHJcbiAgICAgICAgICAgIGF1dG86IGRhdGEuYXV0b0RlcGxveSxcclxuICAgICAgICAgICAgb25saW5lOiBkYXRhLm9ubGluZU51bWJlcixcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pKSk7XHJcbiAgICAgIG92ZXJ2aWV3LmlkID0gKCgpID0+IG5ldHdvcmsoJ0dFVCcsICcvYXBpL2dsb2JhbC91dWlkJykoKS50aGVuKGlkID0+ICh7IGlkIH0pKSk7XHJcbiAgICAgIG92ZXJ2aWV3LnZlcnNpb24gPSAoKCkgPT4gbmV0d29yaygnR0VUJywgJy9hcGkvZ2xvYmFsL3ZlcnNpb24nKSgpLnRoZW4odmVyc2lvbiA9PiAoeyB2ZXJzaW9uIH0pKSk7XHJcblxyXG4gICAgICByZXR1cm4gb3ZlcnZpZXc7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIHJldHVybiBhcGk7XHJcbiAgfV0pO1xyXG59KHdpbmRvdy5iYWNrZW5kQXBpID0gd2luZG93LmJhY2tlbmRBcGkgfHwgYW5ndWxhci5tb2R1bGUoJ2JhY2tlbmRBcGknLCBbXSkpKTtcclxuIl19
