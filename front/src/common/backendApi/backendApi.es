; (function (backendApi) {
  "use strict";

  backendApi.factory('api', ['$http', '$timeout', function ($http, $timeout) {
    const api = {};

    const friendlyErrerMessage = {
    };

    // 一个简易的 Promise
    // 仿照原生的接口（因为没有用 Symbol ，所以其实也不完全是原生的接口）
    // 回调被包裹在 $timeout 里面，以保证可以触发 $digest 周期
    api.SimplePromise = function SimplePromise(resolver) {
      let state = null, value = null;
      let callbacks = [];
      let self = this, waiting = null;
      const resolve =  function (v) {
        if (v === self) throw 'promise should not be resolve by itself';
        if ((typeof v === 'object' || typeof v === 'function') && v &&
            ('then' in v) && (typeof v.then === 'function')) {
          waiting = true;
          try {
            v.then(resolve, reject);
          } catch (e) { reject(e); }
        } else {
          state = true; value = v;
          setTimeout(handleCallbacks, 0);
        }
      };
      const reject = function (v) {
        state = false; value = v;
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
        state = false; value = e;
        setTimeout(handleCallbacks, 0);
      }
      resolver = null;
      var handleCallbacks = function () {
        if (state === null) return;
        while (callbacks.length) {
          let { onFullfilled, onRejected, resolve, reject } = callbacks.shift();
          let callback = state ? onFullfilled : onRejected;
          if (!callback || typeof callback !== 'function') {
            (state ? resolve : reject)(value);
          } else {
            $timeout(function () {
              try { resolve(callback(value)); }
              catch (e) { reject(e); }
            });
          }
        }
      };
      var promise = function (onFullfilled, onRejected, resolve, reject) {
        callbacks.push({ onFullfilled, onRejected, resolve, reject });
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
      const that = this;
      return new api.SimplePromise(function (resolve, reject) {
        that.promise(onFullfilled, onRejected, resolve, reject);
      });
    };
    api.SimplePromise.prototype.catch = function (onRejected) {
      const that = this;
      return new api.SimplePromise(function (resolve, reject) {
        that.promise(void 0, onRejected, resolve, reject);
      })
    };
    api.SimplePromise.all = function (promises) {
      return new api.SimplePromise(function (resolve, reject) {
        let values = [], done = 0;
        try {
          [...promises].forEach((promise, index) => {
            promise.then(value => {
              values[index] = value
              if (++done === promises.length) resolve(values);
            }).catch(reason => {
              reject(reason);
            })
          });
        } catch (e) { reject(e); }
      });
    };
    api.SimplePromise.race = function (promises) {
      return new api.SimplePromise(function (resolve, reject) {
        try {
          [...promises].forEach(promise => promise.then(resolve).catch(reject));
        } catch (e) { reject(e); }
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
    api.loadScript = (function () {
      const cache = Object.create({});
      let loader = function (src, checker, initial) {
        if (checker && checker()) {
          return api.SimplePromise.resolve(true);
        }
        return new api.SimplePromise(function (resolve, reject) {
          const loadDone = function () {
            resolve(checker ? checker() : true);
          };
          let script = document.createElement('script');
          script.src = src;
          script.type = 'text/javascript';
          script.addEventListener('load', function () {
            if (typeof initial === 'function') {
              api.SimplePromise.resolve(initial()).then(loadDone);
            } else loadDone();
          });
          let parent = document.body || document.getElementsByTagName('head')[0];
          parent.appendChild(script);
        });
      };
      return function (src, checker, initial) {
        if (!cache.hasOwnProperty(src)) {
          cache[src] = loader(src, checker, initial);
        }
        return cache[src];
      };
    }());

    // 用来定义一个网络接口
    const network = function(method, url, more) {
      return function(data, ...details) {
        return new api.SimplePromise(function(resolve, reject) {
          const args = angular.merge({}, { method, url }, more, { data }, ...details);
          console.log('[NETWORK][REQUEST] %s %s\n%o', args.method, args.url, args);
          const handleResponse = function(response) {
            try {
              let success = true;
              if (response.status < 200 || response.status >= 300) success = false;
              let data = response.data;
              if (success) {
                if (response.status === 401) {
                  location.href = '/login/login.html';
                  return;
                }
              }
              let result = null, error = null;
              if (success) {
                if (typeof data === 'string') result = data;
                else if (data instanceof ArrayBuffer) result = data;
                else if (typeof data === 'object') {
                  if (data.resultCode === 200) result = data.result;
                  else { success = false; error = data.resultMsg; }
                } else {
                  success = false;
                }
              }
              if (success) {
                console.log('[NETWORK][RESPONSE] %s %s\n%o', args.method, args.url, result);
                resolve(result);
              } else {
                let msg = error || '请求处理时发生错误';
                if (msg in friendlyErrerMessage) msg = friendlyErrerMessage[msg];
                console.warn('[NETWORK][FAIL] %s %s\n%o', args.method, args.url, msg);
                reject(new Error(msg));
              }
            } catch (e) {
              console.warn('[NETWORK][EXCEPTION] %s %s\n%o', args.method, args.url, e);
              reject(new Error(''));
            }
          }
          $http(args).then(handleResponse, handleResponse);
        });
      };
    };


    // 用来定义一个本地计算的数据
    const fake = function (handler) {
      return function (...details) {
        let result, exception, success = true;
        try { result = handler(...details); }
        catch (e) { exception = e; success = false; }
        if (success) return api.SimplePromise.resolve(angular.copy(result));
        else return api.SimplePromise.reject(angular.copy(exception));
      };
    };
    const constant = (x) => () => x;

    api.network = (url, method = 'GET', more = (void 0)) => network(method, url, more)();

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
    api.memberCollection = (function () {
      const memberCollection = {};
      memberCollection.addOne = ((collection, user) =>
        network('POST', '/api/collection_members/single')({
          collectionId: collection.id,
          resourceType: collection.type,
          userId: user.id,
          role: user.role
        }));
      memberCollection.addMany = ((collection, userList) =>
        network('POST', '/api/collection_members/multiple')({
          collectionId: collection.id,
          resourceType: collection.type,
          members: (userList || []).map(({id, role}) => ({ userId: id, role: role }))
        }));
      memberCollection.add = ((collection, userObjOrList) =>
        angular.isArray(userObjOrList) ?
          api.memberCollection.addMany(collection, userObjOrList) :
          api.memberCollection.addOne(collection, userObjOrList));
      memberCollection.modify = ((collection, user) =>
        network('PUT', '/api/collection_members/single')({
          collectionId: collection.id,
          resourceType: collection.type,
          userId: user.id,
          role: user.role
        }));
      memberCollection.delete = ((collection, user) =>
        network('DELETE', `/api/collection_members/${collection.id}/${user.id}/${collection.type}`)());
      memberCollection.get = ((collection) =>
        network('GET', `/api/collection_members/${collection.id}/${collection.type}`)()
          .then(response => (response || []).map(user => ({ id: user.userId, role: user.role, name: user.username }))));
      memberCollection.getTypes = (fake(constant([
        'PROJECT_COLLECTION',
        'DEPLOY_COLLECTION',
        'CLUSTER',
      ])));
      memberCollection.listByType = ((type) =>
        network('GET', `/api/collections/${type}`)()
          .then(response => (response || []).map(collection => ({ id: collection.id, type: type, name: collection.name, description: collection.description }))));
      memberCollection.myRole = ((collection) => api.user.myRole(collection));
      return memberCollection;
    }());

    // user: {id, name, email, phone, loginType, createTime}
    // whoami() => user
    // list() => Array<user>
    // myRole(resource{type, id}) => role
    api.user = (function () {
      const user = {};

      const readUser = user => ({
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone,
        loginType: user.loginType,
        createTime: new Date(user.createTime * 1000),
        isAdmin: 'adminPrivilege' in user ? !!user.adminPrivilege : null,
      });

      user.whoami = (() => network('GET', '/api/user/get')().then(readUser));
      user.list = (() => network('GET', '/api/user/list')().then(response => (response || []).map(readUser)));
      user.myRole = ((resource) => network('GET', `/api/user/resource/${resource.type}/${resource.id}`)());
      // more api not added here, add them when you need some

      return user;
    }());

    api.image = (function () {
      const image = {};

      // 共有镜像
      // image 摘要 { name, tagList.length, downloadCount, icon, createTime }
      // image 详情 { name, tagList, downloadCount, icon, createTime, readmeUrl, description, modifyTime }
      // list => image 摘要
      // detail({ name }) => image 详情
      image.public = (function () {
        const _public = {};

        _public.list = () => network('GET', '/api/image/public/catalog')()
          .then(response => (response || []).map(image => ({
            name: image.imageName,
            tagList: Array(image.size),
            downloadCount: image.downloadCount,
            icon: image.iconUrl,
            updateTime: new Date(image.lastModified),
          })));

        _public.detail = (image) => network('GET', `/api/image/public/image?imageName=${image.name}`)()
          .then(response => ({
            name: response.imageName,
            tagList: (response.tagInfos || []).map(tag => ({
              image: tag.imageName,
              name: tag.imageTag,
              size: tag.imageSize,
              downloadCount: tag.downloadCount,
              createTime: new Date(tag.createTime),
              dockerfileUrl: tag.dockerfileUrl,
              imageUrl: tag.imageUrl,
            })),
            downloadCount: response.downloadCount,
            icon: response.iconUrl,
            createTime: new Date(response.createTime),
            updateTime: new Date(response.lastModified),
            readmeUrl: response.readMeUrl,
            description: response.description,
          }));

        return _public;
      }());

      return image;
    }());

    api.overview = (function () {
      const overview = {};
      overview.usage = (() => network('GET', '/api/overview/usage')().then(data => ({
        project: {
          collection: data.projectCollection,
          total: data.project,
        },
        deploy: {
          collection: data.deployCollection,
          total: data.deployment,
        },
        image: {
          total: data.image,
          base: data.imageBase,
          project: data.imageProject,
          other: data.imageOther,
        },
        cluster: {
          total: data.cluster,
        },
      })));

      overview.resource = (() => network('GET', '/api/overview/resource')().then(data => ({
          memory: {
            total: data.memoryTotal,
            using: data.memoryUsed,
            free: data.memoryTotal - data.memoryUsed,
          },
          cpu: {
            total: data.cpu0To25 + data.cpu25To50 + data.cpu50To75 + data.cpu75To100,
            load_0_25: data.cpu0To25,
            load_25_50: data.cpu25To50,
            load_50_75: data.cpu50To75,
            load_75_100: data.cpu75To100,
          },
          disk: {
            total: data.diskTotal,
            using: data.diskTotal - data.diskRemain,
            free: data.diskRemain,
          },
          node: {
            total: data.node,
            online: data.nodeOnline,
            offline: data.nodeOffline
          }
      })));
      const actionUserFriendlyText = function (target, targetType, verb) {
        return ({
          SET: '添加$',
          MODIFY: '修改$',
          DELETE: '删除$',
          BUILD: '构建$',
        }[verb]).replace(/\$/, () => ({
          PROJECT_COLLECTION: '项目$',
          PROJECT: '工程$',
          DEPLOY_COLLECTION: '服务$',
          DEPLOY: '部署$',
          STORAGE_CLUSTER: '存储$',
          STORAGE_VOLUME: '数据卷$',
        }[targetType]).replace(/\$/, () => target));
      };
      overview.actionList =  (() => network('GET', '/api/overview/operation')().then(data => ({
        actionList: data.map(item => ({
          target: item.resourceName,
          targetType: item.resourceType,
          verb: item.operation,
          user: {
            id: item.userId,
            name: item.userName,
          },
          time: new Date(item.operateTime),
          text: actionUserFriendlyText(item.resourceName, item.resourceType, item.operation),
        })),
      })));
      const alarmUserFriendlyText = function (metric, operator, targetValue, detectedValue) {
        return ({
          cpu_percent: 'CPU使用率 <#> <r>%，为 <l>%',
          memory_percent: '内存使用率 <#> <r>%，为 <l>%',
          disk_percent: '磁盘使用率 <#> <r>%，为 <l>%',
          disk_read: '磁盘读取速率 <#> <r>KB/s，为 <l>KB/s',
          disk_write: '磁盘写入速率 <#> <r>KB/s，为 <l>KB/s',
          network_in: '网络流入速率 <#> <r>KB/s，为 <l>KB/s',
          network_out: '网络流出速率 <#> <r>KB/s，为 <l>KB/s',
          agent_alive: '监控代理未处于活动状态',
        }[metric].replace(/<#>/, () => ({
          '==': '等于',
          '!=': '不等于',
          '<' : '小于',
          '<=': '小于等于',
          '>' : '大于',
          '>=': '大于等于'
        }[operator]))
          .replace(/<l>/, () => (detectedValue + '').slice(0, 4).replace(/\.$/, ''))
          .replace(/<r>/, () => (targetValue + '').slice(0, 4).replace(/\.$/, '')));
      };
      overview.alarmList = (() => network('GET', '/api/alarm/event')().then(data => ({
        alarmList: data.map(item => ({
          time: new Date(item.timeStamp),
          text: alarmUserFriendlyText(item.metric, item.operator, item.rightValue, item.leftValue)
        }))
      }), () => ({
        // 当没有权限访问报警信息时，会返回 null 作为出错信息
        alarmList: null,
      })));
      overview.project = (() => network('GET', '/api/overview/project')().then(data => ({
        action: {
          build: {
            auto: data.autoBuild,
            manual: data.manualBuild,
          }
        }
      })));
      overview.deployment = (() => network('GET', '/api/overview/deployment')().then(data => ({
        action: {
          deploy: {
            auto: data.autoDeploy,
            online: data.onlineNumber,
          }
        }
      })));
      overview.id = (() => network('GET', '/api/global/uuid')().then(id => ({ id })));
      overview.version = (() => network('GET', '/api/global/version')().then(version => ({ version })));

      return overview;
    }());

    return api;
  }]);
}(window.backendApi = window.backendApi || angular.module('backendApi', [])));
