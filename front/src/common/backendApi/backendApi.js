/* jshint esversion: 6 */
; (function (backendApi) {
  "use strict";

  backendApi.factory('api', ['$http', '$timeout', '$filter', 'loginUrl', function ($http, $timeout, $filter, loginUrl) {
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
        /*jshint loopfunc: true */
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
        /*jshint loopfunc: false */
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
      });
    };
    api.SimplePromise.all = function (promises) {
      return new api.SimplePromise(function (resolve, reject) {
        let values = [], done = 0;
        try {
          [...promises].forEach((promise, index) => {
            promise.then(value => {
              values[index] = value;
              if (++done === promises.length) resolve(values);
            }).catch(reason => {
              reject(reason);
            });
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
              let success = response.status >= 200 && response.status < 300;
              let data = response.data;
              if (response.status === 401) {
                location.href = '/login/login.html';
                return;
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
                let ret = new Error(msg);
                ret.response = response;
                reject(ret);
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

    // 全局配置
    api.global = (function () {
      const global = {};

      global.isInMemoryDatabase = (() => network('GET', '/api/global/database')()
        .then(resp => resp === 'H2'));

      return global;
    }());

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
        'CONFIGURATION_COLLECTION',
        'LOADBALANCER_COLLECTION'
      ])));
      memberCollection.listByType = ((type) =>
        network('GET', `/api/collections/${type}`)()
          .then(response => (response || []).map(collection => ({ id: collection.id, type: type, name: collection.name, description: collection.description }))));
      memberCollection.myRole = ((collection) => api.user.myRole(collection));
      return memberCollection;
    }());

    // user: {id, name, email, phone, loginType, createTime, isAdmin}
    // whoami() => user
    // passwd({ name, oldPassword, newPassword }) // for non admin user
    // passwd({ name, newPassword }) // for admin user; oldPassword will always be ignored
    // modify({ id, name, phone, email })
    // list() => Array<user>
    // myRole(resource{type, id}) => role
    // logout() => (void 0)
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

      user.whoami = ((forceReload) => network('GET', '/api/user/get', { cache: !forceReload })().then(readUser));
      user.passwd = (({ name, oldPassword, newPassword }) =>
        user.whoami().then(({ isAdmin }) => {
          if (isAdmin) return network('POST', '/api/user/adminChangePassword')({
            username: name,
            password: newPassword,
          }).catch(error => {
            throw '';
          });
          return network('POST', '/api/user/changePassword')({
            username: name,
            oldpassword: oldPassword,
            newpassword: newPassword
          }).catch(error => {
            if (('' + error).indexOf('password wrong') !== -1) throw '原密码不正确';
            if (('' + error).indexOf('username wrong') !== -1) throw '用户名不正确';
            throw '';
          });
        })
      );
      user.modify = (({ id, name, email, phone }) => 
        network('POST', '/api/user/modify')({
          id, phone, email,
          username: name,
        }));
      user.list = (() => network('GET', '/api/user/list')().then(response => (response || []).map(readUser)));
      user.myRole = ((resource) => network('GET', `/api/user/resource/${resource.type}/${resource.id}`)());
      // more api not added here, add them when you need some

      user.logout = (() => network('GET', '/api/user/logout')()
        .catch(error => {
          if (error.response.status !== -1) throw error;
        }));
      return user;
    }());

    api.image = (function () {
      const image = {};

      // 公有镜像
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
      image.privateRegistry = (function() {
        let _private = {};
        const privateRegistryApi = '/api/image';
          _private.list = () => network('GET', privateRegistryApi)()
              .then(response => (response || []).map(image => ({
                  id: image.projectId,
                  name: image.imageName,
                  registry: image.registry,
                  tag: image.tag,
                  envSettings: image.envSettings,
                  createTime: new Date(image.createTime),
              })));
          //项目镜像和基础镜像的tag
          _private.listImageTags = (name, registry) => network('GET', `${privateRegistryApi}/detail?name=${name}&registry=${registry}`)();
          return _private;
      }());

      return image;
    }());

    /* deployment api */
    api.deployment = (function () {
        const deployment ={};

        deployment.collection = (() => network('GET', '/api/deploycollection')().then(collectionList =>
          collectionList.map(collection => ({
            id: collection.id,
            name: collection.name,
            description: collection.description,
            creator: { id: collection.creatorId, name: collection.creatorName },
            createTime: new Date(collection.createTime),
            memberCount: collection.memberCount,
            deployCount: collection.deployCount,
            role: collection.role
          }))));
        deployment.listInCollection = ((collection) => network('GET', '/api/deploy/list/${collection.id}').then(deploymentList =>
          deploymentList.map(deployment => ({
            id: deployment.deployId,
            name: deployment.deployName,
            createTime: new Date(deployment.createTime),
            lastUpdateTime: new Date(deployment.lastUpdateTime),
            status: deployment.deploymentStatus,
            cluster: { name: deployment.clusterName },
            namespace: deployment.namespace,
            hostEnv: deployment.hostEnv,
            replicas: deployment.replicas,
            monitor: {
              cpu: { total: deployment.cpuTotal, using: deployment.cpuUsed },
              memory: { total: deployment.memoryTotal, using: deployment.memoryUsed },
            },
            serviceDnsName: deployment.serviceDnsName,
            mayDelete: deployment.deletable,
          }))));


        deployment.list = () => network('GET', `/api/deploy/list`)();
        deployment.delete = (deploymentId) => network('DELETE', `/api/deploy/id/${deploymentId}`)();
        deployment.get = (deploymentId) => network('GET', `/api/deploy/id/${deploymentId}`)()
            .then(response => ({
                deployId: response.deployId,
                deployName: response.deployName,
                clusterId: response.clusterId,
                clusterName: response.clusterName,
                clusterLog: response.clusterLog,
                lastUpdateTime: response.lastUpdateTime,
                deploymentStatus: response.deploymentStatus,
                currentReplicas: response.currentReplicas,
                defaultReplicas: response.defaultReplicas,
                namespace: response.namespace,
                currentVersions: (response.currentVersions || []).map(currentVersionDraft => {
                    currentVersionDraft.labelSelectors = (currentVersionDraft.labelSelectors || []).filter(label => label.content === 'USER_LABEL_VALUE');
                    currentVersionDraft.containerConsoles = (currentVersionDraft.containerConsoles || []).map(containerConsole => ({
                        registry: containerConsole.registry,
                        name: containerConsole.image,
                        tag: containerConsole.tag,
                        cpu: containerConsole.cpu,
                        mem: containerConsole.mem,
                        oldEnv: [],
                        newEnv: containerConsole.envs,  // 部署详情和升级页面中使用newEnv
                        healthChecker: containerConsole.healthChecker, // object
                        readinessChecker: containerConsole.readinessChecker, // object
                        logItemDrafts: containerConsole.logItemDrafts,
                        imagePullPolicy: containerConsole.imagePullPolicy,
                        autoDeploy: containerConsole.autoDeploy,
                        volumeMountConsoles: containerConsole.volumeMountConsoles.map(volume => {
                            volume.readonly =  volume.readonly.toString();
                            return volume;
                        }),
                        configConsoles: containerConsole.configConsoles,
                        commands: (containerConsole.commands || [])[0] || '',
                        args: (containerConsole.args || []),
                    }));
                    return currentVersionDraft;
                }), // array
                healthChecker: response.healthChecker,
          // loadBalanceDraft: response.loadBalanceDraft,
          lbForDeploys: response.lbForDeploys,
                scalable: response.scalable,
                stateful: response.stateful,
                serviceDnsName: response.serviceDnsName,
                accessType: response.accessType,
                exposePortNum: response.exposePortNum,
                // innerServiceDraft: response.innerServiceDraft,
                networkMode: response.networkMode,
                versionType: response.versionType,
                deletable: response.deletable,
                deploymentType: response.deploymentType,
                deployTypeShow: response.deployTypeShow,
                description: response.description,

            }));
        // 新建部署
        deployment.create = ((deploymentDraft) => network('POST', `/api/deploy/create`)({
            creatorId: deploymentDraft.creatorId,
            collectionId: deploymentDraft.collectionId,
            deployName: deploymentDraft.name,
            description: deploymentDraft.description,
            versionType: deploymentDraft.versionType,
            deploymentType: deploymentDraft.deploymentType,
            replicas: deploymentDraft.replicas,
            clusterId: deploymentDraft.cluster.id,
            namespace: deploymentDraft.namespace.namespace,
            hostEnv: deploymentDraft.hostEnv,
            networkMode: deploymentDraft.networkMode,
            labelSelectors: (function() {
                const labelMap = {TEST: 'TESTENV', PROD: 'PRODENV'};
                return (deploymentDraft.labelSelectors || []).filter(label => {return label.content !== 'HOSTENVTYPE'})
                    .concat({name: labelMap[deploymentDraft.hostEnv], content: 'HOSTENVTYPE'});
            }()),
        loadBalancerDraft: (function () { // loadBalancer后台需要r
              let loadBalanceDraft = {};
          if (deploymentDraft.visitMode === 'internal') {
              loadBalanceDraft.sessionAffinity = deploymentDraft.loadBalanceDraft.sessionAffinity;
                loadBalanceDraft.type = 'INNER_SERVICE';
                loadBalanceDraft.loadBalancerPorts = deploymentDraft.loadBalanceDraft.loadBalancerPorts.map(loadBalancesPort => ({
                  // 集群内部访问端口(port)和程序服务端口(targetPort)相同
                  port: loadBalancesPort.targetPort,
                  targetPort: loadBalancesPort.targetPort,
                  protocol: 'TCP'
                }));
              } else { loadBalanceDraft = null; }
              return loadBalanceDraft;
            }()),
            accessType: (function() {
                if (deploymentDraft.networkMode === 'HOST') {
                    return 'DIY';
                } else {
                    if (deploymentDraft.visitMode === 'noAccess') {
                        return 'DIY';
                    } else if (deploymentDraft.visitMode === 'internal') {
                         return 'K8S_SERVICE';
                    } else {
                        return 'K8S_SERVICE';
                    }
                }
            }()),
            exposePortNum: deploymentDraft.exposePortNum ? deploymentDraft.exposePortNum: 0,
            // YAML 或者 JSON， 则填充数据
            podSpecStr: ['YAML','JSON'].includes(deploymentDraft.versionType) ? deploymentDraft.versionString.podSpecStr || '' : '',
            // 非CUSTOM类型 置空
            containerConsoles: deploymentDraft.versionType ==='CUSTOM' ? deploymentDraft.containerConsoles.map(containerConsole => ({
                registry: containerConsole.registry,
                image: containerConsole.name,
                tag: containerConsole.tag,
                cpu: containerConsole.cpu,
                mem: containerConsole.mem,
                envs: (containerConsole.oldEnv || []).concat(containerConsole.newEnv),
                healthChecker: containerConsole.healthChecker, // object
                readinessChecker:containerConsole.readinessChecker, //object 
                logItemDrafts: containerConsole.logItemDrafts, // Object
                imagePullPolicy: containerConsole.imagePullPolicy,
                autoDeploy: containerConsole.autoDeploy,
                volumeMountConsoles: (function(){
                    return (containerConsole.volumeMountConsoles || []).map(volumeMountConsole => {
                        return volumeMountConsole;
                    });
                } ()),
                configConsoles: (function(){
                    return (containerConsole.configConsoles || []).map(configConsole => {
                        configConsole.name = configConsole.configMap.name;
                        configConsole.volumeConfigMap.configurationId = configConsole.configMap.id;
                        configConsole.volumeConfigMap.name = configConsole.configMap.name;
                        configConsole.volumeConfigMap.iterms = configConsole.configMap.configFileList.reduce((map,configFile) => {
                            // path 为输入框中输入的路径，对应 deploymentComponent.js <volume-mount-configmap>
                            if(configFile.path) {
                                map[configFile.name] = configFile.path;
                            }
                            return map;
                        },{});
                        configConsole.configMap = void 0;
                        return configConsole;
                    });
                } ()),
                commands:[containerConsole.commands].filter(x=>x),
                args: (containerConsole.args || []).filter(x => x),
            })) : [],
            // containerDrafts: deploymentDraft.containerConsoles,
        }).then(() => {
            // 如果是新建namespace，需要执行创建namespace操作
            if(!deploymentDraft.namespace || !deploymentDraft.namespace.namespace) {
                return;
            }
            if(!deploymentDraft.namespace.isExistentNamespace) {
                let namespaceList = [deploymentDraft.namespace.namespace];
                api.cluster.setNamespace(deploymentDraft.cluster.id, namespaceList);
            }
        }));
        // 更新部署 当前只用于修改描述信息
        deployment.updateDescription = ((deploymentId, deploymentDescription) => network('PUT', `/api/deploy/id/${deploymentId}/description`)(deploymentDescription));
        deployment.getDeploymentStr = (deploymentDraft) => network('POST', `/api/deploy/deploymentstr`)({
            deployName: deploymentDraft.name,
            collectionId: deploymentDraft.collectionId,
            replicas: deploymentDraft.replicas,
            deploymentType: deploymentDraft.deploymentType,
            versionType: deploymentDraft.versionType,
            hostEnv: deploymentDraft.hostEnv,
            clusterId: deploymentDraft.cluster.id,
            namespace: deploymentDraft.namespace.namespace,
            labelSelectors: deploymentDraft.labelSelectors,
            networkMode: deploymentDraft.networkMode,
        });


        //get 获取事件
        deployment.getEvents = (deploymentId) => network('GET', `/api/deploy/event/list?deployId=${deploymentId}`)();
        //get 部署实例
        deployment.getInstances = (deploymentId) => network('GET', `/api/deploy/${deploymentId}/instance`)();
      // get 网络访问
      deployment.getDeployLoadBalance = (deploymentId => network('GET', `/api/deploy/id/${deploymentId}/loadbalancer`)());
      deployment.updateLoadBalance = (deploymentId, loadBalanceDraft) => network('PUT', `/api/deploy/id/${deploymentId}/loadbalancer`)({
          sessionAffinity: loadBalanceDraft.sessionAffinity,
        loadBalancerPorts: (loadBalanceDraft.loadBalancerPorts || []).map(loadBalancesPort => ({
                // 集群内部访问端口(port)和程序服务端口(targetPort)相同
                port: loadBalancesPort.targetPort,
                targetPort: loadBalancesPort.targetPort,
          protocol: 'TCP',
        })),
        });
        /**
         * 版本相关接口 version
         */
        deployment.version = (function() {
            const version = {};
            const versionAPI = "/api/version";
            version.listVersion = (deploymentId) => network('GET', `${versionAPI}/list?deployId=${deploymentId}`)();
            version.getVersionById = (deploymentId, versionId) => network('GET', `${versionAPI}/id/${deploymentId}/${versionId}`)()
                .then(response => ({
                    deployId: response.deployId,
                    id: response.id,
                    description: response.description,
                    labelSelectors: (response.labelSelectors || []).filter(label => label.content === 'USER_LABEL_VALUE'),
                    hostList: response.hostList,
                    versionType: response.versionType,
                    podSpecStr: response.podSpecStr,
                    version: response.version,
                    createTime: response.createTime,
                    deprecate: response.deprecate,
                    containerConsoles: (response.containerConsoles || []).map(containerConsole => ({
                        registry: containerConsole.registry,
                        name: containerConsole.image,
                        tag: containerConsole.tag,
                        cpu: containerConsole.cpu,
                        mem: containerConsole.mem,
                        oldEnv: [],
                        newEnv: containerConsole.envs, // 获取部署版本时，可修改已有环境变量 ,部署详情和升级页面中使用newEnv
                        healthChecker: containerConsole.healthChecker, // object
                        readinessChecker:containerConsole.readinessChecker,
                        logItemDrafts: containerConsole.logItemDrafts,
                        imagePullPolicy: containerConsole.imagePullPolicy,
                        autoDeploy: containerConsole.autoDeploy,
                        volumeMountConsoles: containerConsole.volumeMountConsoles.map(volume => {
                            volume.readonly =  volume.readonly.toString();
                            return volume;
                        }),
                        configConsoles: containerConsole.configConsoles,
                        commands: (containerConsole.commands || [])[0] || '',
                        args: (containerConsole.args || []),
                    })),
                    clusterName: response.clusterName,
                    hostEnv: response.hostEnv,
                    networkMode: response.networkMode,
                    versionString: response.versionString,
                }));
            // 新建部署版本 version
            version.createVersion = (deploymentId, versionDraft) => network('POST', `${versionAPI}/create?deployId=${deploymentId}`)({
                deployId: versionDraft.deployId,
                labelSelectors:  (function() {
                    const hostEnvLabelMap = {
                        TEST: {name: 'TESTENV', content: 'HOSTENVTYPE'},
                        PROD: {name: 'PRODENV', content: 'HOSTENVTYPE'}
                    };
                    versionDraft.labelSelectors = versionDraft.labelSelectors.filter(label => {return label.content !== 'HOSTENVTYPE'})
                        .concat(hostEnvLabelMap[versionDraft.hostEnv]);
                    return versionDraft.labelSelectors;
                }()),
                hostList: versionDraft.hostList,
                versionType: versionDraft.versionType,
                podSpecStr:  ['YAML','JSON'].includes(versionDraft.versionType) ? versionDraft.versionString.podSpecStr || '' : '',
                version: versionDraft.version,
                deprecate: versionDraft.deprecate,
                containerConsoles:  versionDraft.versionType ==='CUSTOM' ? versionDraft.containerConsoles.map(containerConsole => ({
                    registry: containerConsole.registry,
                    image: containerConsole.name,
                    tag: containerConsole.tag,
                    cpu: containerConsole.cpu,
                    mem: containerConsole.mem,
                    envs: (containerConsole.oldEnv || []).concat(containerConsole.newEnv),
                    healthChecker: containerConsole.healthChecker, // object
                    readinessChecker:containerConsole.readinessChecker,
                    logItemDrafts: containerConsole.logItemDrafts, // Object
                    imagePullPolicy: containerConsole.imagePullPolicy,
                    autoDeploy: containerConsole.autoDeploy,
                    commands:[containerConsole.commands].filter(x=>x),
                    args: (containerConsole.args || []).filter(arg => arg),
                    volumeMountConsoles: (function(){
                        return (containerConsole.volumeMountConsoles || []).map(volumeMountConsole => {
                            return volumeMountConsole;
                        });
                    } ()),
                    configConsoles: (function(){
                        return (containerConsole.configConsoles || []).map(configConsole => {
                            configConsole.name = configConsole.configMap.name;
                            configConsole.volumeConfigMap.configurationId = configConsole.configMap.id;
                            configConsole.volumeConfigMap.name = configConsole.configMap.name;
                            configConsole.volumeConfigMap.iterms = configConsole.configMap.configFileList.reduce((map,configFile) => {
                                // path 为输入框中输入的路径，对应 deploymentComponent.js <volume-mount-configmap>
                                if(configFile.path) {
                                    map[configFile.name] = configFile.path;
                                }
                                return map;
                            },{});
                            //configConsole.configMap = void 0;
                            return configConsole;
                        });
                    } ()),
                })) : [],
            });
            // 废除版本
            version.deprecateVersion = (deployId, versionId) => network('DELETE', `${versionAPI}/${deployId}/${versionId}/deprecate`)();
            // 还原版本
            version.recoverDeprecateVersion = (deployId, versionId) => network('PUT', `${versionAPI}/${deployId}/${versionId}/enable`)();
            return version;
        }());
        deployment.action = (function() {
            let action = {};
            const actionAPI = "/api/deploy/action";
            action.updateDeployment = (deploymentId, versionId, replicas) => network('POST', `${actionAPI}/update?deployId=${deploymentId}&version=${versionId}&replicas=${replicas}`)();
            // 停止
            action.stop = (deploymentInfo) => network('POST', `${actionAPI}/stop?deployId=${deploymentInfo.id}`)();
            // 中断
            action.abort = (deploymentInfo) => network('POST', `${actionAPI}/abort?deployId=${deploymentInfo.id}`)();

            action.rollback = (deployInfo) => {
              return network('POST',`/api/deploy/action/rollback?deployId=${deployInfo.id}&version=${deployInfo.version}`+ (deployInfo.replicas?`&replicas=${deployInfo.replicas}`:''))();
            };

            action.update = (deployInfo) => {
              return network('POST',`/api/deploy/action/`+(deployInfo.currentVersion > deployInfo.version?'rollback':'update')+`?deployId=${deployInfo.id}&version=${deployInfo.version}`+ (deployInfo.replicas?`&replicas=${deployInfo.replicas}`:''))().then(response=>{
                return {
                  response:response,
                  tip:'已提交，正在'+(deployInfo.currentVersion > deployInfo.version?'回滚':'升级')+'。',
                }
              });
            };

            action.start = (deployInfo) => {
                return network('POST',`/api/deploy/action/start?deployId=${deployInfo.id}&version=${deployInfo.version}`+ (deployInfo.replicas?`&replicas=${deployInfo.replicas}`:''))();
            };

            action.scale = (deployInfo) =>{
              if(deployInfo.labels.length){
                return network('POST',`/api/deploy/action/daemonset/scales?deployId=${deployInfo.id}&version=${deployInfo.currentVersion}`)(deployInfo.labels).then(response => {
                    return {
                      response:response,
                      tip:'操作成功',
                    }
                });
              }
              else{
                return network('POST',`/api/deploy/action/`+(deployInfo.replicas>deployInfo.currentReplicas?'scaleup':'scaledown')+`/?deployId=${deployInfo.id}&version=${deployInfo.currentVersion}&replicas=${deployInfo.replicas}`)().then(response => {
                  return {
                    response:response,
                    tip:'已提交，正在'+(deployInfo.replicas>deployInfo.currentReplicas?'扩容':'缩容')+'。',
                  }
                });
              }
            }

            action.restart = (instanceInfo) => network('DELETE',`/api/deploy/${instanceInfo.id}/instance?instanceName=${instanceInfo.instanceName}`)();
            
            return action;
        } ());
        return deployment;
    }());

    /*cluster api
    *
    * listHostLabel 主机标签 转换后结构：[{name, content}]
    * */

    api.cluster = (function() {
        const cluster = {};
        const clusterAPI = '/api/cluster';
        cluster.getClusterById = (clusterId) => network('GET', `${clusterAPI}/${clusterId}`)()
            .then(response => ({
                id: response.id,
                name: response.name,
                logConfig: response.logConfig,
                api: response.api,
                tag: response.tag,
                ownerName: response.ownerName,
                role: response.role,
                domain: response.domain,
                createTime: response.createTime,
                clusterMonitor: response.clusterMonitor,
                nodeNum: response.nodeNum,
                podNum: response.podNum,
                buildConfig: response.buildConfig
            }));
        cluster.listCluster = () => network('GET', clusterAPI)()
            .then(response => (response || []).map(cluster => ({
                id: cluster.id,
                name: cluster.name,
                logConfig: cluster.logConfig,
                api: cluster.api,
                tag: cluster.tag,
                ownerName: cluster.ownerName,
                role: cluster.role,
                domain: cluster.domain,
                createTime: cluster.createTime,
                clusterMonitor: cluster.clusterMonitor,
                nodeNum: cluster.nodeNum,
                podNum: cluster.podNum,
                buildConfig: cluster.buildConfig
            })));
        cluster.getNamespace =(clusterId) => network('GET', `${clusterAPI}/${clusterId}/namespace`)();
        cluster.setNamespace = (clusterId, namespaceList) => network('POST', `${clusterAPI}/${clusterId}/namespace`)(namespaceList);

        cluster.listNodeList = clusterId => network('GET', `${clusterAPI}/${clusterId}/nodelist`)()
            .then(response => (response || []).map(node => ({
                name: node.name,
                ip: node.ip,
                status: node.status,
                runningPods: node.runningPods,
                capacity: node.capacity,
                disk: node.disk,
                createTime: node.createTime,
                labels: node.labels, // this is object
                dockerVersion: node.dockerVersion,
                kubeletVersion: node.kubeletVersion,
                kernelVersion: node.kernelVersion,
                osVersion: node.osVersion,
            })));
        cluster.listHostLabel = (clusterId) => network('GET', `${clusterAPI}/${clusterId}/labels`)()
            .then(response => {
                return Object.keys(response || {}).map(key => ({name: key, content: response[key]}));
            });
        cluster.listNodeByLabels = (clusterId, labels) => {
            let label = (labels || []).reduce((map,label) => {map[label.name] = label.content;return map;},{});
            let labelString = encodeURI(JSON.stringify(label));
            return (network('GET', `${clusterAPI}/${clusterId}/nodelistwithlabels?labels=${labelString}`)()
                .then(response => (response || []).map(node => ({
                    name: node.name,
                    ip: node.ip,
                    status: node.status,
                    runningPods: node.runningPods,
                    capacity: node.capacity,
                    disk: node.disk,
                    createTime: node.createTime,
                    labels: node.labels, // this is object
                    dockerVersion: node.dockerVersion,
                    kubeletVersion: node.kubeletVersion,
                    kernelVersion: node.kernelVersion,
                    osVersion: node.osVersion,
                }))));
        };
        cluster.hasNodeByLabels = (clusterId, labels) => cluster.listNodeByLabels(clusterId, labels)
            .then(response => !!response.length);
        cluster.listInstance = (clusterId => network('GET', `/api/cluster/${clusterId}/instancelist`)()
          .then(response => (response || []).map(instance => instance)));
      /**
       *
       * 根据主机标签获取实例列表
       *
       *  clusterId 集群ID
       *
       *  labels 主机标签 [{name: '', content: ''}]
       */
        cluster.listInstanceByLabel = ((clusterId, labels) => {
          let label = Object.assign({},...(labels||[]).map(({name,content})=>({[name]:content})));
          // let label = (labels || []).reduce((map,label) => {map[label.name] = label.content;return map;},{});
          let labelString = encodeURI(JSON.stringify(label));
          return network('GET', `/api/cluster/${clusterId}/instancelistwithlabels?labels=${labelString}`)()
            .then(response => (response || []).map(instance => instance));
        });
      /**
       * 添加主机标签
       *
       *  clusterId 集群ID
       *
       *  nodeLabelList = {key: value} key为标签, value为标签类型,例如 {'TESTENV','HOSTENVTYPE '}
       */
        cluster.addNodeLabels = ((clusterId, nodeLabelList) => network('POST', `/api/cluster/${clusterId}/nodelabels/add`)
          ((nodeLabelList || []).map(nodeLabel => ({
            node: nodeLabel.nodeName,
            labels: nodeLabel.labels,
          }))));
        cluster.deleteNodeLabels = ((clusterId, nodeLabelList) => network('POST', `/api/cluster/${clusterId}/nodelabels/delete`)
          ((nodeLabelList || []).map(nodeLabel => ({
            node: nodeLabel.nodeName,
            labels: nodeLabel.labels,
          }))));
        return cluster;
    }());

    /*config map api
    *
    * listConfigMapCollection 配置集合列表 [{id, name, description, createTime, role, configMapCount, memberCount, creatorInfo}]
    * */
    api.configMap = (function() {
        const configMap = {};
        const configMapAPI = '/api/configurationcollection';
        // configMap collection api
        configMap.listConfigMapCollection = () => network('GET', configMapAPI)()
            .then(response => (response || []).map(configMapCollection => ({
                id: configMapCollection.id,
                name: configMapCollection.name,
                description: configMapCollection.description,
                createTime: configMapCollection.createTime,
                role: configMapCollection.role,
                configMapCount: configMapCollection.configurationCount,
                memberCount: configMapCollection.memberCount,
                creatorInfo: configMapCollection.creatorInfo,
            })));
        configMap.createConfigMapCollection = ((configMapCollection) => network('POST', configMapAPI)({
            name: configMapCollection.name,
            description: configMapCollection.description,
            }));
        configMap.getConfigMapCollectionById =(configMapCollectionId => network('GET', `${configMapAPI}/${configMapCollectionId}`)()
            .then(response => ({
                id: response.configurationCollection.id,
                name: response.configurationCollection.name,
                description: response.configurationCollection.description,
                createTime: response.configurationCollection.createTime,
                creatorId: response.creatorInfo.creatorId,
                creatorName: response.creatorInfo.name,
            })));
        configMap.deleteConfigMapCollection = (configMapCollectionId => network('DELETE', `${configMapAPI}/${configMapCollectionId}`)());
        configMap.updateConfigMapCollection = (configMapCollection => network('PUT', configMapAPI)(configMapCollection));
        // configMap api
        configMap.listConfigMap = (configMapCollectionId => network('GET', `${configMapAPI}/${configMapCollectionId}/configuration`)()
            .then(response => (response || []).map(configMap => ({
                id: configMap.configuration.id,
                name: configMap.configuration.name,
                description: configMap.configuration.description,
                clusterId: configMap.configuration.clusterId,
                namespace: configMap.configuration.namespace,
                labelSelectors: configMap.configuration.labelSelectors,
                data: configMap.configuration.data,
                //由于页面组件需要list，因此做转换
                configFileList: Object.keys(configMap.configuration.data || {}).map((key) => ({name:key,content:configMap.configuration.data[key]})),
                createTime: configMap.configuration.createTime,
                creatorInfo: configMap.creatorInfo,
                creator: configMap.creatorInfo.name,
                clusterName: configMap.clusterName,
                collectionId: configMap.collectionId,
            }))));
        configMap.listConfigMapAll = () => network('GET', `${configMapAPI}/configuration`)()
            .then(response => (response || []).map(configMap => ({
                id: configMap.configuration.id,
                name: configMap.configuration.name,
                description: configMap.configuration.description,
                clusterId: configMap.configuration.clusterId,
                namespace: configMap.configuration.namespace,
                labelSelectors: configMap.configuration.labelSelectors,
                data: configMap.configuration.data,
                configFileList: Object.keys(configMap.configuration.data || {}).map((key) => ({name:key,content:configMap.configuration.data[key]})),
                createTime: configMap.configuration.createTime,
                creatorInfo: configMap.creatorInfo,
                creator: configMap.creatorInfo.name,
                clusterName: configMap.clusterName,
                collectionId: configMap.collectionId,
            })));
        configMap.listConfigMapByClusterId = (clusterId => network('GET', `${configMapAPI}/cluster/${clusterId}/configuration`)()
            .then(response => (response || []).map(configMap => ({
                id: configMap.configuration.id,
                name: configMap.configuration.name,
                description: configMap.configuration.description,
                clusterId: configMap.configuration.clusterId,
                namespace: configMap.configuration.namespace,
                labelSelectors: configMap.configuration.labelSelectors,
                data: configMap.configuration.data,
                configFileList: Object.keys(configMap.configuration.data || {}).map((key) => ({name:key,content:configMap.configuration.data[key]})),
                createTime: configMap.configuration.createTime,
                creatorInfo: configMap.creatorInfo,
                creator: configMap.creatorInfo.name,
                clusterName: configMap.clusterName,
                collectionId: configMap.collectionId,
            }))));
        configMap.listConfigMapByClusterIdAndNamespace = ((clusterId, namespace) => network('GET', `${configMapAPI}/cluster/${clusterId}/${namespace}/configuration`)()
            .then(response => (response || []).map(configMap => ({
                id: configMap.configuration.id,
                name: configMap.configuration.name,
                description: configMap.configuration.description,
                clusterId: configMap.configuration.clusterId,
                namespace: configMap.configuration.namespace,
                labelSelectors: configMap.configuration.labelSelectors,
                data: configMap.configuration.data,
                configFileList: Object.keys(configMap.configuration.data || {}).map((key) => ({name:key,content:configMap.configuration.data[key]})),
                createTime: configMap.configuration.createTime,
                creatorInfo: configMap.creatorInfo,
                creator: configMap.creatorInfo.name,
                clusterName: configMap.clusterName,
                collectionId: configMap.collectionId,
            }))));
        configMap.createConfigMap = ((configMapCollectionId, configMap) => network('POST', `${configMapAPI}/${configMapCollectionId}/configuration`)({
            name: configMap.name,
            description: configMap.description,
            clusterId: configMap.clusterId,
            namespace: configMap.namespace,
            data: configMap.configFileList.reduce((map,configFile) => {map[configFile.name] = configFile.content;return map;},{}),
        }));
        configMap.getConfigMap = (configMapId => network('GET', `${configMapAPI}/configuration/${configMapId}`)()
            .then(configMap => ({
                id: configMap.configuration.id,
                name: configMap.configuration.name,
                description: configMap.configuration.description,
                clusterId: configMap.configuration.clusterId,
                namespace: configMap.configuration.namespace,
                labelSelectors: configMap.configuration.labelSelectors,
                configFileList: Object.keys(configMap.configuration.data || {}).map((key) => ({name:key,content:configMap.configuration.data[key]})),
                data: configMap.configuration.data,
                createTime: configMap.configuration.createTime,
                creatorInfo: configMap.creatorInfo,
                creator: configMap.creatorInfo.name,
                clusterName: configMap.clusterName,
                collectionId: configMap.collectionId,
            })));
        configMap.deleteConfigMap = (configMapId => network('DELETE', `${configMapAPI}/configuration/${configMapId}`)());
        configMap.updateConfigMap = ((configMapCollectionId, configMap) => network('PUT', `${configMapAPI}/${configMapCollectionId}/configuration`)({
            id: configMap.id,
            name: configMap.name,
            description: configMap.description,
            clusterId: configMap.clusterId,
            namespace: configMap.namespace,
            labelSelectors: configMap.labelSelectors,
            createTime: configMap.createTime,
            data: configMap.configFileList.reduce((map,configFile) => {map[configFile.name] = configFile.content;return map;},{}),
        }));
        configMap.listRelatedDeploy = (configMapId => network('GET', `${configMapAPI}/configuration/${configMapId}/deployinfo`)());
        return configMap;
    }());

    api.overview = (function () {
      const overview = {};
      overview.usage = (() => network('GET', '/api/overview/usage')().then(data => ({
        project: {
          collection: data.projectCollection || 0,
          total: data.project || 0,
        },
        deploy: {
          collection: data.deployCollection || 0,
          total: data.deployment || 0,
        },
        image: {
          total: data.image || 0,
          base: data.imageBase || 0,
          project: data.imageProject || 0,
          other: data.imageOther || 0,
        },
        cluster: {
          total: data.cluster || 0,
        },
        storage: {
          total: data.storage || 0,
        },
        volume: {
          total: data.volume || 0,
          using: data.volumeUsing || 0,
        },
        config: {
          collection:data.configurationCollection || 0,
          total:data.configuration || 0,
        },
        loadBalance:{
          total:data.loadBalancerCollection,
          nginx:data.loadBalancerNginx,
          kubeProxy:data.loadBalancerProxy,
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
          node: {
            total: data.node,
            online: data.nodeOnline,
            offline: data.nodeOffline
          }
      })));
      overview.disk = (() => network('GET', '/api/overview/disk')().then(data => ({
        disk: {
          total: data.diskTotal,
          using: data.diskTotal - data.diskRemain,
          free: data.diskRemain,
        },
      })));
      const actionUserFriendlyText = function (target, targetType, verb) {
        let targetMap = {
          PROJECT_COLLECTION: '项目$',
          PROJECT: '工程$',
          DEPLOY_COLLECTION: '服务$',
          DEPLOY: '部署$',
          STORAGE_CLUSTER: '存储$',
          CONFIGURATION: '配置$',
          CONFIGURATION_COLLECTION: '配置集合$',
          CLUSTER:'集群$',
            LOADBALANCER:'负载均衡实例$',
            LOADBALANCER_COLLECTION:'负载均衡$',
        },
        verbMap = {
          SET: '添加$',
          MODIFY: '修改$',
          DELETE: '删除$',
          BUILD: '构建$',
          SCALEUP: '扩容$',
          SCALEDOWN: '缩容$',
          START: '启动$',
          STOP: '停止$',
          UPDATE: '升级$',
          ROLLBACK: '回滚$',
          ABORT: '中断$',
          DELETEINSTANCE:'重启$实例'
        };
        if(targetMap.hasOwnProperty(targetType) && verbMap.hasOwnProperty(verb)){
            return (verbMap[verb]).replace(/\$/, () => (targetMap[targetType]).replace(/\$/, () => target));
        }
      };

      overview.actionList =  (() => network('GET', '/api/overview/operation')().then(data => {
         let actionList = [];
         for(let item of data){
           let txt = actionUserFriendlyText(item.resourceName, item.resourceType, item.operation);
           if(txt.length){
             actionList.push({
                target: item.resourceName,
                targetType: item.resourceType,
                verb: item.operation,
                user: {
                  id: item.userId,
                  name: item.userName,
                },
                time: new Date(item.operateTime),
                text: txt
             })
           }
         }
         return {actionList:actionList}
      }));

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
            online_detail: (data.onlineDetails || []).map(online => ({
              start: online.startNumber,
              update: online.updateNumber,
              rollback: online.rollbackNumber,
              scale_up: online.scaleUpNumber,
              scale_down: online.scaleDownNumber,
            })),
          }
        }
      })));
      overview.id = (() => network('GET', '/api/global/uuid')().then(id => ({ id })));
      overview.version = (() => network('GET', '/api/global/version')().then(version => ({ version })));

      return overview;
    }());

    api.globleConfig = (function () {
      const globleConfig = {};

      globleConfig.hasGitProject = (gitid) => network('GET', `/api/global/gitconfig/${gitid}/usage`)().then(response => {
          return response && response.length;
      })

      return globleConfig;
    }());

    api.globalSetting = (function () {
      const globalSetting = {};

      globalSetting.login = (function () {
        const login = {};

        login.getLdapConfig = () => network('GET', '/api/global/ldapconfig')().then(config => ({
          enabled: true,
          server: config.server,
          suffix: config.emailSuffix,
        })).catch(error => ({
          enabled: false,
        }));

        login.getSsoConfig = () => network('GET', '/api/global/ssoconfig')().then(config => ({
          enabled: true,
          server: config.casServerUrl,
          login: config.loginUrl,
          logout: config.logoutUrl,
        })).catch(error => ({
          enabled: false,
        }));

        login.getConfig = () => api.SimplePromise.all([
          login.getLdapConfig(),
          login.getSsoConfig(),
        ]).then(([ldapConfig, ssoConfig]) => ({
          ldapConfig, ssoConfig
        }));

        login.putLdapConfig = (ldapConfig) => (
          ldapConfig.enabled ?
            network('POST', '/api/global/ldapconfig')({
              server: ldapConfig.server,
              emailSuffix: ldapConfig.suffix,
            }) :
            network('DELETE', '/api/global/ldapconfig')()
        );
        login.putSsoConfig = (ssoConfig) => (
          ssoConfig.enabled ?
            network('POST', '/api/global/ssoconfig')({
              casServerUrl: ssoConfig.server,
              loginUrl: ssoConfig.login,
              logoutUrl: ssoConfig.logout,
            }) :
            network('DELETE', '/api/global/ssoconfig')()
        );

        login.putConfig = ({ ldapConfig, ssoConfig }) => api.SimplePromise.all([
          login.putLdapConfig(ldapConfig),
          login.putSsoConfig(ssoConfig),
        ]);

        return login;
      }());

      return globalSetting;
    }());
    api.select = (function () {
      let select = {};

      /*
       * 将后台返回的对象转换为一个{ text, value, match } 的结构体，用于 form-select-with-backend 模块读取
       * text 表示下拉框将会展示的文本
       *    接受键字符串或函数
       * remark 表示下拉框右侧要展示的描述信息
       *    接受键字符串或函数
       * value 表示选中时 ng-model 的值
       *    接受函数，省略时相当于 (x => x) 函数，建议省略
       * match 表示 ng-model 满足什么条件时认为匹配
       *    接受键字符串、键字符串数组或函数，缺省为 "id"
       */
      let toOptions = ({ text, remark, value, match }) => {
        if (typeof text === 'string') text = (text => o => o[text])(text);
        if (typeof remark === 'undefined') remark = () => '';
        if (typeof remark === 'string') remark = (remark => o => o[remark])(remark);
        if (typeof value === 'undefined') value = o => o;
        if (typeof match === 'undefined') match = ['id'];
        if (typeof match === 'string') match = [match];
        if (Array.isArray(match)) {
          match = (match => o =>
            Object.assign({}, ...(match.map(i => (i in o ? { [i]: o[i] } : {}))))
          )(match);
        }
        return list => list.map(element => ({
          text: text(element),
          remark: remark(element),
          value: value(element),
          match: match(element)
        }));
      };
      let withParam = (testGiven, fetcher) => param =>
        (param && testGiven(param) ? fetcher : fake(constant([])))(param);

      select.deployCollectionList = (() => network('GET', `/api/deploycollection`)()
        .then(response => response.map(collection => ({ id: collection.id, name: collection.name })))
        .then(toOptions({ text: 'name' })));
      select.deployListByCollection = withParam(collection => 'id' in collection,
        collection => network('GET', `/api/deploy/list/${collection.id}`)()
          .then(response => response
            .filter(deploy => deploy.versionType === 'CUSTOM')
            .map(deploy => ({
              id: deploy.deployId,
              name: deploy.deployName,
              collection: collection
            }))
          )
          .then(toOptions({ text: 'name' }))
      );
      select.deployVersionList = withParam(deploy => 'id' in deploy,
        deploy => network('GET', `/api/version/list?deployId=${deploy.id}`)()
          .then(response => response.map(version => ({ id: version.version, deploy })))
          .then(toOptions({ text: v => `version${v.id}` }))
      );
      select.imageVersionList = withParam(image => 'name' in image && 'registry' in image,
        image => network('GET', `/api/image/detail?name=${image.name}&registry=${image.registry}`)()
          .then(response => response.map(obj => ({
            name: obj.tag,
            createTime: obj.createTime,
          })))
          .then(toOptions({
            text: 'name',
            remark: image => $filter('time')(image.createTime),
            value: image => image.name,
          }))
      );

      return select;
    }());

    /**
     * 负载均衡 api接口
     */
    api.loadBalance = (function () {
      let loadBalance = {};
      // collection 负载均衡组
      loadBalance.collection = (function () {
        let collection = {};
        const collectionAPI = "/api/loadBalancerCollection";
        collection.list = (() => network('GET', `/api/loadBalancerCollection/list`)()
          .then(collectionsResponse => (collectionsResponse || []).map(collection => ({
            id: collection.id,
            name: collection.name,
            description: collection.description,
            creatorName: collection.creatorName,
            creatorId: collection.creatorId,
            createTime: collection.createTime,
            type: collection.lbcType,
            loadBalancerCount: collection.loadBalancerCount,
            memberCount: collection.memberCount,
            role: collection.role,
          }))));
        collection.getById = (collectionId) => network('GET', `/api/loadBalancerCollection/${collectionId}`)()
          .then(response => ({
            id: response.id,
            name: response.name,
            description: response.description,
            creatorName: response.creatorName,
            creatorId: response.creatorId,
            createTime: response.createTime,
            type: response.lbcType,
            role: response.role,
          }));
        collection.create = (collection => network('POST', `/api/loadBalancerCollection`)({
          name: collection.name,
          description: collection.description,
          type: collection.type,
        }));
        collection.update = (collection => network('PUT', `/api/loadBalancerCollection`)({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          type: collection.type,
        }));
        collection.delete = (collectionId => network('DELETE', `/api/loadBalancerCollection/${collectionId}`)());
        return collection;
      }());
      // 负载均衡 api
      loadBalance.loadBalance = (function () {
        let loadBalance = {};
        const loadBalanceURL = "/api/loadBalancer";
        // 新建负载均衡  kube={type: 'EXTERNAL_SERVICE'} nginx={type: 'NGINX'}两种类型
        loadBalance.create = (loadBalanceDraft) => network('POST', `/api/loadBalancer`)({
          lbcId: loadBalanceDraft.collectionId,
          name: loadBalanceDraft.name,
          description: loadBalanceDraft.description,
          type: loadBalanceDraft.type,
          clusterId: loadBalanceDraft.cluster.id,
          namespace: loadBalanceDraft.namespace.namespace,
          externalIPs: loadBalanceDraft.type === 'EXTERNAL_SERVICE' ? loadBalanceDraft.externalIPs : (loadBalanceDraft.nginxDraft.nodeDraft || []).map(node => node.ip),
          serviceDraft: (function () {
            let service = {};
            if (loadBalanceDraft.type === 'EXTERNAL_SERVICE') {
              service.lbPorts = loadBalanceDraft.serviceDraft.lbPorts;
              service.sessionAffinity = loadBalanceDraft.serviceDraft.sessionAffinity;
              service.deployId = loadBalanceDraft.serviceDraft.deployment.deployId;
              service.deployName = loadBalanceDraft.serviceDraft.deployment.deployName;
              service.deployStatus = loadBalanceDraft.serviceDraft.deployment.deployStatus;
            } else {service = null;}
            return service;
          }()),
          nginxDraft: (function () {
            let nginx = {};
            if (loadBalanceDraft.type === 'NGINX') {
              nginx.listenPort = loadBalanceDraft.nginxDraft.listenPort;
              // nginx.nodeNames = (loadBalanceDraft.nginxDraft.nodeDraft || []).map(node => node.name);
              nginx.registry = loadBalanceDraft.nginxDraft.registry;
              nginx.image = loadBalanceDraft.nginxDraft.image;
              nginx.tag = loadBalanceDraft.nginxDraft.tag;
              nginx.lbMethod = loadBalanceDraft.nginxDraft.lbMethod;
              nginx.cpu = loadBalanceDraft.nginxDraft.cpu;
              nginx.mem = loadBalanceDraft.nginxDraft.mem;
              // selectors为array类型，后台接口限制，需要标签数组
              nginx.selectors = loadBalanceDraft.nginxDraft.hostEnv ==='TEST' ? [{name: "TESTENV", content: "HOSTENVTYPE"}] : [{name: "PRODENV", content: "HOSTENVTYPE"}];
              nginx.volumeConsole = (function () {
                if (loadBalanceDraft.nginxDraft.volumeConsole.volumeType === 'EMPTYDIR') {
                  return null;
                } else if (loadBalanceDraft.nginxDraft.volumeConsole.volumeType === 'HOSTPATH') {
                  return {
                    readonly: false,
                    hostPath: loadBalanceDraft.nginxDraft.volumeConsole.hostPath,
                    volumeType: loadBalanceDraft.nginxDraft.volumeConsole.volumeType,
                  };
                } else {return null;}
              }());
              nginx.rules = (loadBalanceDraft.nginxDraft.rules && loadBalanceDraft.nginxDraft.rules.length !== 0) ? loadBalanceDraft.nginxDraft.rules.map(rule => ({
                  domain: rule.domain,
                  deployId: rule.deployment.deployId,
                  deployName: rule.deployment.deployName,
                  deployStatus: rule.deployment.deployStatus,
                  serviceName: rule.deployment.innerServiceName,
                  servicePort: rule.servicePort,
                })):null;
            }else {
              nginx = null;
            }
            return nginx;
          }()),
        }).then(() => {
          // 如果是新建namespace，需要执行创建namespace操作
          if (loadBalanceDraft.type !== 'NGINX') return;
          if(!loadBalanceDraft.namespace || !loadBalanceDraft.namespace.namespace) return;
          if(!loadBalanceDraft.namespace.isExistentNamespace) {
            let namespaceList = [loadBalanceDraft.namespace.namespace];
            api.cluster.setNamespace(loadBalanceDraft.cluster.id, namespaceList);
          }
        });
        // 查询所有负载均衡实例
        loadBalance.listAll = () => network('GET', `/api/loadBalancer/list`)()
          .then(response => (response || []).filter(lb => lb.type === 'NGINX').map(loadBalance => ({
            deployId: loadBalance.id,
            deployName: loadBalance.name,
            type: loadBalance.type,
            clusterName: loadBalance.clusterName,
            namespace: loadBalance.namespace,
            lastUpdateTime: loadBalance.lastUpdateTime,
            createTime: loadBalance.createTime,
            dnsName: loadBalance.dnsName,
            state: loadBalance.state,
            deletable: loadBalance.deletable,
            cpuTotal: loadBalance.cpuTotal,
            cpuUsed: loadBalance.cpuUsed,
            memoryTotal: loadBalance.memoryTotal,
            memoryUsed: loadBalance.memoryUsed,
            hostEnv: (loadBalance.selectors || []).some(label => label.name === 'PRODENV') ? 'PROD' : 'TEST',
          })));
        // 根据负载均衡组ID查询负载均衡列表
        loadBalance.list = (collectionId) => network('GET', `/api/loadBalancer/list/${collectionId}`)()
          .then(response => (response || []).map(loadBalance => ({
            id: loadBalance.id,
            name: loadBalance.name,
            type: loadBalance.type,
            clusterName: loadBalance.clusterName,
            namespace: loadBalance.namespace,
            lastUpdateTime: loadBalance.lastUpdateTime,
            createTime: loadBalance.createTime,
            dnsName: loadBalance.dnsName,
            state: loadBalance.state,
            deletable: loadBalance.deletable,
            cpuTotal: loadBalance.cpuTotal,
            cpuUsed: loadBalance.cpuUsed,
            memoryTotal: loadBalance.memoryTotal,
            memoryUsed: loadBalance.memoryUsed,
            // 资源占用百分比
            resourcePercent: (function () {
              let cpuPercent = loadBalance.cpuTotal ? Math.max(0, loadBalance.cpuUsed / loadBalance.cpuTotal) : 0;
              let memPercent = loadBalance.memoryTotal ? Math.max(0, loadBalance.memoryUsed / loadBalance.memoryTotal) : 0;
              if (cpuPercent > memPercent) {
                return {value: 'cpu', text: 'CPU', cpuTotal: loadBalance.cpuTotal, cpuUsed: loadBalance.cpuUsed, percent: cpuPercent};
              } else {
                return {value: 'memory', text: '内存', memoryTotal: loadBalance.memoryTotal, memoryUsed: loadBalance.memoryUsed, percent: memPercent};
              }
            }()),
          }))) ;
        loadBalance.listDeployment = (clusterId, namespace, loadBalanceType) => network('GET', `/api/loadBalancer/deploy/list?clusterId=${clusterId}&namespace=${namespace}&lbType=${loadBalanceType}`)();
        loadBalance.getById = (loadBalanceId) => network('GET', `/api/loadBalancer/id/${loadBalanceId}`)()
          .then(response => {
            if (response.nginxDraft) {
              response.nginxDraft.rules = (response.nginxDraft.rules || []).map(rule => ({
                domain: rule.domain,
                deployId: rule.deployId,
                deployName: rule.deployName,
                deployStatus: rule.deployStatus,
                serviceName: rule.serviceName,
                servicePort: rule.servicePort,
                deployment: { //用于前端显示
                  deployId: rule.deployId,
                  deployName: rule.deployName,
                  deployStatus: rule.deployStatus,
                }
              }));
              if (response.nginxDraft.currentVersions) {
                response.nginxDraft.currentVersions = response.nginxDraft.currentVersions.map(versionDraft => {
                  // versionDraft.nodeDraft = (versionDraft.nodeNames || []).map(nodeName => ({ name: nodeName }));
                  versionDraft.nodeDraft = (versionDraft.externalIPs || []).map(nodeIP => ({ ip: nodeIP }));
                  versionDraft.hostEnv = (versionDraft.selectors || []).some(label => label.name === 'PRODENV') ? 'PROD' : 'TEST';
                  versionDraft.volumeDraft = (!versionDraft.volumeDraft) ? {volumeType: 'EMPTYDIR'} : versionDraft.volumeDraft;
                  return versionDraft;
                });
              }
            } else if (response.serviceDraft) {
              response.serviceDraft.deployment = {
                deployId: response.serviceDraft.deployId,
                deployName: response.serviceDraft.deployName,
                deployStatus: response.serviceDraft.deployStatus,
              };
              response.serviceDraft.sessionAffinity = String(response.serviceDraft.sessionAffinity)
            }
            return response;
          });
        loadBalance.delete = (loadBalanceId) => network('DELETE', `/api/loadBalancer/id/${loadBalanceId}`)();
        // 更新
        loadBalance.update = (loadBalanceDraft) => network('PUT', `/api/loadBalancer`)({
          lbcId: loadBalanceDraft.lbcId,
          id: loadBalanceDraft.id,
          name: loadBalanceDraft.name,
          description: loadBalanceDraft.description,
          type: loadBalanceDraft.type,
          clusterId: loadBalanceDraft.clusterId,
          namespace: loadBalanceDraft.namespace,
          externalIPs: loadBalanceDraft.externalIPs,
          serviceDraft: (function () {
            let service = {};
            if (loadBalanceDraft.type === 'EXTERNAL_SERVICE') {
              service.lbPorts = loadBalanceDraft.serviceDraft.lbPorts;
              service.sessionAffinity = loadBalanceDraft.serviceDraft.sessionAffinity;
              service.deployId = loadBalanceDraft.serviceDraft.deployment.deployId;
              service.deployName = loadBalanceDraft.serviceDraft.deployment.deployName;
              service.deployStatus = loadBalanceDraft.serviceDraft.deployment.deployStatus;
            } else {service = null;}
            return service;
          }()),
          nginxDraft: (function () {
            let nginx = {};
            if (loadBalanceDraft.type === 'NGINX') {
              nginx.rules = (loadBalanceDraft.nginxDraft.rules || []).map(rule => ({
                domain: rule.domain,
                deployId: rule.deployment.deployId,
                deployName: rule.deployment.deployName,
                deployStatus: rule.deployment.deployStatus,
                serviceName: rule.deployment.innerServiceName,
                servicePort: rule.servicePort,
              }));
            }else {
              nginx = null;
            }
            return nginx;
          }()),
        });
        loadBalance.listInstance = (loadBalanceId) => network('GET', `/api/loadBalancer/instance/list/${loadBalanceId}`)();
        loadBalance.restartInstance = ((loadBalanceId, instanceName) => network('DELETE', `/api/loadBalancer/instance/${loadBalanceId}?instanceName=${instanceName}`)());
        loadBalance.updateDescription = (loadBalanceId, description) => network('PUT', `/api/loadBalancer/id/${loadBalanceId}/description`)(description);
        loadBalance.listEvent = (loadBalanceId) => network('GET', `/api/loadBalancer/event/list/${loadBalanceId}`)();
        return loadBalance;
      }());
      // nginx负载均衡版本 version
      loadBalance.version = (function () {
        let version = {};
        version.listVersion = (loadBalanceId) => network('GET', `/api/loadBalancer/version/list/${loadBalanceId}`)();
        version.getVersionById = (loadBalanceId, versionId) => network('GET', `/api/loadBalancer/version/id/${loadBalanceId}/${versionId}`)()
          .then(response => {
            //response.nodeDraft = (response.nodeNames || []).map(nodeName => ({ name: nodeName })); //前端展示需要 原来使用主机名称，后改成主机IP
            response.nodeDraft = (response.externalIPs || []).map(nodeIP => ({ ip: nodeIP })); //前端展示需要
            response.hostEnv = (response.selectors || []).some(label => label.name === 'PRODENV') ? 'PROD' : 'TEST';
            response.volumeDraft = (!response.volumeDraft) ? {volumeType: 'EMPTYDIR'} : response.volumeDraft;
            return response;
          });
        version.create = (loadBalanceId, versionDraft) => network('POST', `/api/loadBalancer/version/${loadBalanceId}`)({
          listenPort: versionDraft.listenPort,
          externalIPs: (versionDraft.nodeDraft || []).map(node => node.ip).filter(node => node != null),
          // nodeNames: (versionDraft.nodeDraft || []).map(node => node.name),
          registry: versionDraft.registry,
          image: versionDraft.image,
          tag: versionDraft.tag,
          lbMethod: versionDraft.lbMethod,
          cpu: versionDraft.cpu,
          mem: versionDraft.mem,
          deployIdForLB: versionDraft.deployIdForLB,
          // selectors为array类型，后台接口限制，需要标签数组
          selectors: versionDraft.hostEnv ==='TEST' ? [{name: "TESTENV", content: "HOSTENVTYPE"}] : [{name: "PRODENV", content: "HOSTENVTYPE"}],
          volumeDraft: (function () {
            if (versionDraft.volumeDraft.volumeType === 'EMPTYDIR') {
              return null;
            } else if (versionDraft.volumeDraft.volumeType === 'HOSTPATH') {
              return {
                readonly: false,
                hostPath: versionDraft.volumeDraft.hostPath,
                volumeType: versionDraft.volumeDraft.volumeType,
              };
            } else {return null;}
          }()),
        });
        return version;
      }());
      // nginx负载均衡操作
      loadBalance.action = (function () {
        let action = {};
        action.rollback = ((loadBalanceId, versionId) => network('POST', `/api/loadBalancer/action/rollback/${loadBalanceId}/${versionId}`)());
        action.scale = ((loadBalanceId, versionId, nodeList) => network('POST', `/api/loadBalancer/action/scales/${loadBalanceId}/${versionId}`)(nodeList));
        action.start = ((loadBalanceId, versionId) => network('POST', `/api/loadBalancer/action/start/${loadBalanceId}/${versionId}`)());
        action.stop = ((loadBalanceId) => network('POST', `/api/loadBalancer/action/stop/${loadBalanceId}`)());
        action.update = ((loadBalanceId, versionId) => network('POST', `/api/loadBalancer/action/update/${loadBalanceId}/${versionId}`)());
        return action;
      }());
      return loadBalance;
    }());
    /**
     * 请求列表接口
     */
    api.listItem = (function(){
      let listItem = {};
      const loadBalanceURL = '/api/loadBalancer';
      listItem.nodeByLabels = (parameters) => {
        let hostLabels = [];
        const hostEnvLabelMap = {
          TEST: {name: 'TESTENV', content: 'HOSTENVTYPE'},
          PROD: {name: 'PRODENV', content: 'HOSTENVTYPE'}
        };
        hostLabels = hostLabels.filter(label => label.content !== 'HOSTENVTYPE').concat(hostEnvLabelMap[parameters.hostEnv]);
        let label = (hostLabels || []).reduce((map,label) => {map[label.name] = label.content;return map;},{});
        let labelString = encodeURIComponent(JSON.stringify(label));
        return (network('GET', `/api/cluster/${parameters.clusterId}/nodelistwithlabels?labels=${labelString}`)()
          .then(response =>
            (response || []).map(node => ({
              value: {name: node.name,
                ip: node.ip,
                status: node.status,
                runningPodsCount: node.runningPods,
                capacity: node.capacity,
                disk: node.disk,
                createTime: node.createTime,
                labels: node.labels,
              },
              text: node.ip,
              remark: '名称：' + node.name + ' ' + '状态：' + node.status,
              match: { ip: node.ip }
            })).filter(node => node.value.status === 'Ready')
          ));
      };
      listItem.loadBalanceDeployment = (parameters) => {
        return network('GET', `/api/loadBalancer/deploy/list?clusterId=${parameters.clusterId}&namespace=${parameters.namespace}&lbType=${parameters.loadBalanceType}`)().then(response => (response || []).map(deployment => ({
          value:deployment,
          text:deployment.deployName,
          match:{deployName:deployment.deployName}
        })))
      };
      listItem.storageByClusterIdAndNamespace = (parameters) => {
        return network('GET',`/api/storage/cluster/${parameters.clusterId}/${parameters.namespace}/volume`)().then(response => (response || []).map(volume => ({
          value:{
            id: volume.storageVolumeDraft.id,
            name: volume.storageVolumeDraft.name,
            description: volume.storageVolumeDraft.description,
            clusterId: volume.storageVolumeDraft.clusterId,
            clusterName: volume.storageVolumeDraft.clusterName,
            namespace: volume.storageVolumeDraft.namespace,
            labels: volume.storageVolumeDraft.labels,
            capacity: volume.storageVolumeDraft.capacity,
            accessMode: volume.storageVolumeDraft.accessMode,
            readOnly: volume.storageVolumeDraft.readOnly,
            reclaimPolicy: volume.storageVolumeDraft.reclaimPolicy,
            glusterfsDraft: volume.storageVolumeDraft.glusterfsDraft,
            cephfsDraft: volume.storageVolumeDraft.cephfsDraft,
            rbdDraft: volume.storageVolumeDraft.rbdDraft,
            creatorInfo: volume.creatorInfo,
            status: volume.status,
            storageType: volume.storageVolumeDraft.storageType
          },
          text:volume.storageVolumeDraft.name,
          remark:'状态：' + volume.status + '/类型：' + volume.storageVolumeDraft.storageType,
          match:{name:volume.storageVolumeDraft.name}
        })))
      };
      listItem.foreignServiceIPByClusterId = (parameters) => {
        return network('GET', `/api/cluster/${parameters.clusterId}/nodelist`)().then(response=>(response || []).map(node => ({
          value:node.ip,
          text:node.ip,
          remark: '主机：' + node.name + ' ' + '状态：' + node.status,
          match:node.ip
        })))
      };
      return listItem;
    })();

    return api;
  }]);

  backendApi.factory('userFriendlyMessage', [function () {
    let rules = [
      { pattern: /^.*FORBIDDEN.*$/, message: '抱歉，您没有权限操作该项目。' }
    ];
    return function (message) {
      rules.forEach(function (rule) {
        message = message.replace(rule.pattern, rule.message);
      });
      return message;
    };
  }]);

}(angular.module('backendApi', ['constant'])));
