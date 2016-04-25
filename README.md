# server
This is the web server of domeos

部署DomeOS系统流程

(2016-03-25 update)

(2016-03-30 update start_node_centos.sh脚本更新，--monitor-transfer参数值可设置多个地址，agent镜像升级)

(2016-03-31 分离cluster-ip-range和flannel使用的ip段，SkyDNS添加--nameservers参数)

(2016-04-11 start_node_centos.sh和start_master_centos.sh添加主机IP地址选择策略，在多IP情况下优先选用内网IP)

(2016-04-23 update:

  01. 各个镜像时区统一设定为Asia/Shanghai;
  02. start_etcd.sh、start_node_centos.sh和start_master_centos.sh更新;
  03. 各镜像升级版本;
  04. ETCD升级至2.3.1版本;
  05. 各脚本、安装包等下载链接变更;
  06. 添加clean-k8s-resource.sh、stop-k8s-master.sh、stop-k8s-node.sh脚本;
  07. 各步骤添加是否安装成功测试;
  08. 监控模块去除dashboard组件;
  09. 添加docker容器方式启动DomeOS Server;
  10. 完善DomeOS Server全局配置说明;
  11. 更正监控模块的graph组件http和rpc的端口号)

## STEP 01: 配置和启动ETCD集群

脚本: start_etcd.sh (http://deploy-domeos.bjcnc.scs.sohucs.com/start_etcd.sh)

配置文件: etcd_node_list.conf (http://deploy-domeos.bjcnc.scs.sohucs.com/etcd_node_list.conf)

可执行文件: etcd (http://deploy-domeos.bjcnc.scs.sohucs.com/etcd)

辅助文件: etcdctl (http://domeos-script.bjctc.scs.sohucs.com/etcdctl)

说明:

  1. 上面给出的下载链接etcd版本为2.3.1，也可根据需要使用其它版本的etcd。
  
  2. etcdctl主要用于后台查询和调试，非必需。
  
  3. 安装时需要将start_etcd.sh、etcd_node_list.conf、etcd放到同一目录下。
  
  4. 将用于部署ETCD集群的主机IP列表写入etcd_node_list.conf中，每行一个IP。
  
  5. 启动前请确认各主机的系统时间一致，如不一致请通过ntpdate进行校准，如 ntpdate ntp.sohu.com。
  
  6. 脚本中默认数据存储目录为脚本所在目录的etcd-data子目录下，默认peer port为4010，默认client port为4012，如果需要可以在脚本中的第二步进行修改。
  
  7. 如果主机中已安装过ETCD，则ETCD从低版本升级到高版本时，需要删除老数据文件（ETCD自身bug）。
  
  8. 使用方式：sudo sh start_etcd.sh <当前主机在etcd_node_list.conf中的位置，从1开始>。
  
  9. 还没启动所有节点时会报找不到未启动节点的错误，属正常现象，所有节点启动后将不报该错误。

样例: 

  etcd_node_list.conf文件内容如下:
 
    10.11.151.97
    10.11.151.100
    10.11.151.101
 
  则需要在10.11.151.97主机上执行sudo sh start_etcd.sh 1
  
  在10.11.151.100主机上执行sudo sh start_etcd.sh 2
  
  在10.11.151.101主机上执行sudo sh start_etcd.sh 3
  
测试:

  通过" curl -L <结点IP>:<ETCD服务端口>/health "查看各个节点服务状态，如果返回的health为true说明该节点上的ETCD正常，如:
  
    command: curl -L 10.11.151.97:4012/health
    result : {"health": "true"}
  
参考:

  ETCD官方地址(https://coreos.com/etcd/)


## STEP 02: 配置和启动kubernetes master端

脚本: start_master_centos.sh (http://domeos-script.bjctc.scs.sohucs.com/start_master_centos.sh)

程序包: domeos-k8s-master.tar.gz (http://domeos-script.bjctc.scs.sohucs.com/domeos-k8s-master.tar.gz, 包含: flanneld, mk-docker-opts.sh, kube-apiserver, kube-controller-manager, kube-scheduler, kube-proxy, kubectl)

辅助脚本: 
  1. change_hostname.sh (http://domeos-script.bjctc.scs.sohucs.com/change_hostname.sh)
  2. clean-k8s-resource.sh (http://domeos-script.bjctc.scs.sohucs.com/clean-k8s-resource.sh)
  3. stop-k8s-master.sh (http://domeos-script.bjctc.scs.sohucs.com/stop-k8s-master.sh)

说明:

  1. 脚本会对hostname进行检查，如果不符合DNS规范，请通过change_hostname.sh脚本对主机hostname进行修改。
  
  2. 脚本中安装docker时需要连接互联网，下载domeos-k8s-master.tar.gz需要连接互联网。如果所在主机无法访问外网，可先将domeos-k8s-master.tar.gz放到脚本所在目录，注释脚本中下载domeos-k8s-master.tar.gz的语句，并在本地安装完docker后再执行该脚本。
  
  3. 脚本成功执行后，将以systemctl的形式启动如下服务: flanneld, docker, kube-apiserver, kube-controller-manager, kube-scheduler, kube-proxy。

  4. 通过运行stop-k8s-master.sh可摘除master，docker和flannel也会被停止；如果需要在摘除前清理所有kubernetes启动的资源，可运行clean-k8s-resource.sh。
  
  5. --service-cluster-ip-range和--flannel-network-ip-range地址段不能有重叠。

参数说明:

    --kube-apiserver-port: kubernetes apiserver 服务端口。默认8080
    --etcd-servers: ETCD服务集群地址，各地址间以逗号分隔。必需
    --service-cluster-ip-range: kubernetes集群service的可用地址范围。默认172.16.0.0/13
    --flannel-network-ip-range: Flannel网络可用地址范围。默认172.24.0.0/13
    --flannel-subnet-len: 分配给flannel结点的子网长度。默认22
    --cluster-dns: 集群DNS服务的IP地址，注意不加端口号，IP地址需落在--service-cluster-ip-range范围内。默认172.16.40.1
    --cluster-domain: 集群的search域。默认为domeos.local
    --insecure-bind-address: kube-apiserver非安全访问服务地址。默认0.0.0.0
    --insecure-port: kube-apiserver非安全访问服务端口。默认8080
    --secure-bind-address: kube-apiserver非安全访问服务地址。默认0.0.0.0
    --secure-port: kube-apiserver非安全访问服务端口。默认6443
    --authorization-mode: 
    --authorization-policy-file:
    --basic-auth-file: 以上这三个参数均与kube-apiserver授权认证相关，具体含义参考kubernetes帮助文档。默认不加
    --docker-graph-path: docker运行时的根路径，容器、本地镜像等会存储在该路径下，占用空间大，建议设置到大容量磁盘上。默认为脚本所在路径下的docker-graph目录
    --insecure-docker-registry: 非安全连接的docker私有仓库，可以先设置该值而不用启动对应的registry。必需
    --secure-docker-registry: 安全连接的docker私有仓库。默认为空
    --docker-registry-crt: 如果设置了--secure-docker-registry，则该值必需，表示私有仓库的证书。
    
样例: 

  1. 最简参数

    sudo sh start_master_centos.sh --etcd-servers http://10.11.151.97:4012 --insecure-docker-registry 10.11.150.76:5000

  2. 最全参数

    sudo sh start_master_centos.sh --kube-apiserver-port 8080 --etcd-servers http://10.11.151.97:4012,http://10.11.151.100:4012,http://10.11.151.101:4012 --service-cluster-ip-range 172.16.0.0/13 --flannel-network-ip-range 172.24.0.0/13 --flannel-subnet-len 22 --cluster-dns 172.16.40.1 --cluster-domain domeos.local --insecure-bind-address 0.0.0.0 --insecure-port 8080 --secure-bind-address 0.0.0.0 --secure-port 6443 --authorization-mode ABAC --authorization-policy-file /opt/domeos/openxxs/k8s-1.1.7-flannel/authorization --basic-auth-file /opt/domeos/openxxs/k8s-1.1.7-flannel/authentication.csv --docker-graph-path /opt/domeos/openxxs/docker --insecure-docker-registry 10.11.150.76:5000 --secure-docker-registry https://private-registry.sohucs.com --docker-registry-crt /opt/domeos/openxxs/k8s-1.1.7-flannel/registry.crt
	
测试:

  通过"kubectl cluster-info"查看Kubernetes Master的状态，如果显示"Kubernetes master is running at http://localhost:8080"说明正常运行。
  
参考:

  Kubernetes官方文档(http://kubernetes.io)
  Docker RPM包下载地址(https://yum.dockerproject.org/repo/main/centos/7/Packages/)

## STEP 03: 配置和启动docker registry

启动方式: docker容器

镜像: pub.domeos.org/domeos/docker-registry-driver-sohustorage:1.0

命令: 
    
    sudo docker run --restart=always -d -p <_port>:5000 -e REGISTRY_STORAGE_SOHUSTORAGE_ACCESSKEY=<_access_key> -e REGISTRY_STORAGE_SOHUSTORAGE_SECRETKEY=<_secret_key> -e REGISTRY_STORAGE_SOHUSTORAGE_REGION=<_region> -e REGISTRY_STORAGE_SOHUSTORAGE_BUCKET=<_bucket> --name <_name> pub.domeos.org/domeos/docker-registry-driver-sohustorage:1.0

参数说明: 

    _port: 外部访问端口。
    _access_key: 搜狐云台账户的accesskey。
    _secret_key: 搜狐云台账户的secretkey。
    _region: 搜狐云台存储空间所在地域。
    _bucket: 搜狐云台存储空间名称。
    _name: 容器名称。
    
说明: 

  1. 该方式创建的私有仓库将对接到搜狐云存储(cs.sohu.com)上。

  2. 如果docker registry需要使用https安全访问，则加入如下额外参数:
     -v <主机certs目录所在路径>:/certs
     -e REGISTRY_HTTP_TLS_CERTIFICATE=<registry.crt文件路径>
     -e REGISTRY_HTTP_TLS_KEY=<registry.key文件路径>

  3. 若想启本地存储的私有仓库，可以直接使用官方的registry镜像，启动过程请参考https://hub.docker.com/_/registry/

样例:

    sudo docker run --restart=always -d -p 5000:5000 -e REGISTRY_STORAGE_SOHUSTORAGE_ACCESSKEY=f5ynwwOZ2k2yT4+qxzmA6A== -e REGISTRY_STORAGE_SOHUSTORAGE_SECRETKEY=MUC9NeF8vXvt0y2f+6dIXA== -e REGISTRY_STORAGE_SOHUSTORAGE_REGION=bjcnc -e REGISTRY_STORAGE_SOHUSTORAGE_BUCKET=registry --name private-registry pub.domeos.org/domeos/docker-registry-driver-sohustorage:1.0

测试:

  通过" curl -L http://<registry的服务地址>/v2/ "查看docker registry的运行状态，如果显示"{}"说明正常运行，如:

    command: curl -L http://10.11.150.76:5000/v2/
    result : {}
	
参考:

  registry官方文档(https://hub.docker.com/_/registry/)
  

## STEP 04: 配置和启动MySQL，并创建所需数据库和表结构

数据库: 

domeos, graph (https://github.com/domeos/server/blob/v0.2-beta/DomeOS/src/main/resources/1.create-database.sh)

表结构: 

domeos (https://github.com/domeos/server/blob/v0.2-beta/DomeOS/src/main/resources/create-db.sql)
graph (https://github.com/domeos/server/blob/v0.2-beta/DomeOS/src/main/resources/graph-db-schema.sql)

初始用户: 

insert-data.sql (https://github.com/domeos/server/blob/v0.2-beta/DomeOS/src/main/resources/insert-data.sql)，会创建一个DomeOS系统的超级管理员用户，user: admin  pwd: admin

说明:

如果以非容器形式启动MySQL，需要在数据库中给--flannel-network-ip-range地址段以及--service-cluster-ip-rangeIP地址段授权。

## STEP 05: 配置和启动监控相关组件

启动方式: docker容器

镜像:

  1. graph: pub.domeos.org/domeos/graph:0.5.7

  2. transfer: pub.domeos.org/domeos/transfer:0.0.15

  3. query: pub.domeos.org/domeos/query:1.5.1

命令:

    graph: sudo docker run -d -v <_graph>:/home/work/data/6070 -e DB_DSN="\"<_graph_db_user>:<_graph_db_passwd>@tcp(<_graph_db_addr>)/graph?loc=Local&parseTime=true\"" --name graph -p <_graph_http_port>:6070 -p <_graph_rpc_port>:6071 --restart=always pub.domeos.org/domeos/graph:0.5.7

    transfer: sudo docker run -d -e JUDGE_ENABLE="false" -e GRAPH_CLUSTER=<_graph_cluster> -p <_transfer_port>:8433 --name transfer --restart=always pub.domeos.org/domeos/transfer:0.0.15

    query: sudo docker run -d -e GRAPH_CLUSTER=<_graph_cluster> -p <_query_port>:9966 --name query --restart=always pub.domeos.org/domeos/query:1.5.1
  
参数说明:

    _graph: 数据文件存储路径。
    _graph_db_user: 用于graph的MySQL数据库的用户名。
    _graph_db_passwd: 用于graph的MySQL数据库的密码。
    _graph_db_addr: 用于graph的MySQL数据库的地址，格式为IP:Port
    _graph_http_port: graph服务http端口。
    _graph_rpc_port: graph服务rpc端口。
    _graph_cluster: graph服务数据结点，格式为键值对，多个结点间以逗号分隔。
    _transfer_port: transfer服务端口。
    _query_port: query服务端口。
  
说明:

  1. 参数中需要转义双引号的地方不能省略。

  2. transfer和graph可以启动多个。

  3. transfer和query的GRAPH_CLUSTER参数必须完全一致。

  4. 监控系统是在open-falcon基础上扩展而来，graph、transfer、query三个组件未做修改，详细配置可参考open-falcon文档。

样例:

    graph: sudo docker run -d -v /opt/my/data:/home/work/data/6070 -e DB_DSN="\"domeos:xxxx@tcp(10.11.10.10:3307)/graph?loc=Local&parseTime=true\"" --name graph -p 6070:6070 -p 6071:6071 --restart=always pub.domeos.org/domeos/graph:0.5.7

    transfer: sudo docker run -d -e JUDGE_ENABLE="false" -e GRAPH_CLUSTER="\"node-00\":\"10.11.54.13:6070\",\"node-01\":\"10.11.54.14:6070\"" -p 8433:8433 --name transfer --restart=always pub.domeos.org/domeos/transfer:0.0.15

    query: sudo docker run -d -e GRAPH_CLUSTER="\"node-00\":\"10.11.54.13:6070\",\"node-01\":\"10.11.54.14:6070\"" -p 9967:9966 --name query --restart=always pub.domeos.org/domeos/query:1.5.1

测试:

  通过" curl -s <graph/transfer/query的服务地址>/health "查看graph/transfer/query的运行状态，如果返回"ok"说明graph/transfer/query正常运行，注意graph中使用的是_graph_http_port端口，如:
  
    command: curl -s 10.11.54.13:6071/health
    result : ok
  
参考:

  open-falcon官方文档(http://book.open-falcon.org/zh/intro/index.html)

## STEP 06: 配置和启动DomeOS Server

非容器方式:

  源码: 
  
  domeos/server (https://github.com/domeos/server/tree/v0.2-beta/DomeOS)
  
  说明:
  
1. 编译打包后设置如下环境变量再启动tomcat服务即可
	
    MYSQL_HOST: MySQL服务器的地址
    MYSQL_PORT: MySQL服务端口
    MYSQL_USERNAME: 用于登录MySQL服务器的用户名
    MYSQL_PASSWORD: 用于登录MySQL服务器的密码
    MYSQL_DB: DomeOS使用的数据库名
	  
2. 以非容器形式启动DomeOS Server需要单独启动WebSSH Server，具体启动方式见STEP 07
	
容器方式:

  镜像: pub.domeos.org/domeos/server:1.2.3
  
  命令: 
  
    sudo docker run -d --restart=always --name <_domeos_server_name> -p <_domeos_server_port>:8080 -e MYSQL_HOST=<_mysql_host> -e MYSQL_PORT=<_mysql_port> -e MYSQL_USERNAME=<_mysql_username> MYSQL_PASSWORD=<_mysql_password> MYSQL_DB=<_mysql_db> pub.domeos.org/domeos/server:1.2.3
  
  参数说明:
  
    _domeos_server_name: 容器的名字。
    _domeos_server_port: DomeOS Server的服务端口。
    _mysql_host: MySQL服务器的地址。
    _mysql_port: MySQL服务端口。
    _mysql_username: 用于登录MySQL服务器的用户名。
    _mysql_password: 用于登录MySQL服务器的密码。
    _mysql_db: DomeOS使用的数据库名，即STEP 04中的domeos数据库。
	
  样例:
  
    sudo docker run -d --restart=always --name domeos_server -e MYSQL_HOST=10.16.42.199 -e MYSQL_PORT=3307 -e MYSQL_USERNAME=root -e MYSQL_PASSWORD=mypassword MYSQL_DB=domeos -p 8080:8080 pub.domeos.org/domeos/server:1.2.3
  
测试:

  在浏览器中访问DomeOS Server服务地址，并通过普通账户->admin账户(初始密码admin)进行登录，登录成功说明DomeOS服务正常。

## STEP 07: 配置和启动WebSSH组件

启动方式: docker容器

镜像: pub.domeos.org/domeos/shellinabox:1.0

命令: 

    sudo docker run -d --restart=always -p <_port>:4200 --name shellinabox pub.domeos.org/domeos/shellinabox:1.0

参数说明:

    _port: WebSSH的服务端口。
	
说明: 

1. 以非容器方式启动DomeOS Server时需要单独启动WebSSH Server，容器方式已经将WebSSH Server集成进镜像中不再需要单独启动WebSSH Server。
  
样例:

    sudo docker run -d --restart=always -p 4200:4200 --name shellinabox pub.domeos.org/domeos/shellinabox:1.0
  
测试:

  通过"curl -s <WebSSH服务地址>"查看WebSSH服务状态，如果返回了一个"File Not Found"的页面信息而不是返回空，说明WebSSH服务运行正常，如:

    command: curl -s 10.11.151.97:4200
    result :
    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xml:lang="en" lang="en">
    <head>
    <title>404 File Not Found</title>
    </head>
    <body>
    File Not Found
    </body>
    </html>
	
参考:

  shellinabox项目地址(https://github.com/domeos/shellinabox)

  
## STEP 08: DomeOS系统录入参数

  全局配置->"LDAP"->OpenLDAP服务器地址
    OpenLDAP的服务地址以及端口号，样例: ldap://ldap.sohu-inc.com  123
	
  全局配置->"LDAP"->email后缀
    OpenLDAP登录时的E-mail后缀，样例: @sohu-inc.com
	
  全局配置->"代码仓库"->代码仓库地址
    GitLab的地址，样例: http://code.sohuno.com
	
  全局配置->"私有仓库"->私有仓库地址
    Docker registry的地址，样例: http://10.11.150.76:5000 或 pub.domeos.org
    如果使用https访问的私有仓库，则勾选"https"并将registry.crt证书文件内容粘贴至"证书信息"中
	
  全局配置->"服务器"->服务器地址
    DomeOS Server的地址，样例: http://beta.domeos.sohucs.com
	
  全局配置->"监控配置"-> transfer
    transfer服务地址，样例 10.11.150.76:8082
	
  全局配置->"监控配置"-> graph
    graph服务地址，样例 10.11.150.76:8083
	
  全局配置->"监控配置"-> query
    query服务地址，样例 10.11.150.76:8084
	
  全局配置->"Web SSH"->Web SSH服务地址
    如果DomeOS Server以非容器方式启动，则这项设置为单独启动的WebSSH服务地址，样例:http://10.11.150.76:4200
    如果DomeOS Server以容器方式启动，则WebSSH服务地址必须设置为: http://localhost:4200

  集群管理->新建集群->api server
    kube-apiserver服务地址，样例:10.16.42.200:8080
	
  集群管理->新建集群->dns服务器
    kubernetes集群内DNS服务地址，注意不能添加端口号，样例:172.16.40.1
	
  集群管理->新建集群->etcd
    ETCD集群服务地址，注意必须加http://前缀，样例:http://10.16.42.200:8080
	
  集群管理->新建集群->domain
    kubernetes集群内DNS服务search域，样例:domeos.local
  若想成功启动项目构建，该kubernetes集群需要被添加到集群管理中，并且配置其中的至少一台主机可以用于构建，请在添加完集群后完成如下
  
  全局配置->"构建集群"->api server
    kube-apiserver服务地址，样例:10.16.42.200:8080
	
  全局配置->"构建集群"->namespace
    kubernetes集群的namespace，默认为default

## STEP 09: 添加kubernetes node

脚本: start_node_centos.sh (http://domeos-script.bjctc.scs.sohucs.com/start_node_centos.sh)

程序包: domeos-k8s-node.tar.gz (http://domeos-script.bjctc.scs.sohucs.com/domeos-k8s-node.tar.gz，包含: flanneld, mk-docker-opts.sh, kube-proxy, kubelet, kubectl)

辅助脚本:
  1. change_hostname.sh (http://domeos-script.bjctc.scs.sohucs.com/change_hostname.sh)
  2. stop-k8s-node.sh (http://domeos-script.bjctc.scs.sohucs.com/stop-k8s-node.sh)
  
镜像: pub.domeos.org/domeos/agent:2.4

说明:

  1. 脚本会对hostname进行检查，如果不符合DNS规范，请通过change_hostname.sh脚本对主机hostname进行修改。
  
  2. 在DomeOS系统中node包含标签PRODENV=HOSTENVTYPE表示可用于生产环境；包含标签TESTENV=HOSTENVTYPE表示可用于测试环境；包含标签BUILDENV=HOSTENVTYPE表示可用于构建镜像。
  
  3. 在添加node时集群的DNS服务可不启动。
  
  4. 脚本中安装docker时需要连接互联网，下载domeos-k8s-node.tar.gz需要连接互联网。如果所在主机无法访问外网，可先将domeos-k8s-node.tar.gz放到脚本所在目录，注释脚本中下载domeos-k8s-node.tar.gz的语句；在本地安装完docker；将镜像pub.domeos.org/domeos/agent:2.4上传至私有仓库中，同时修改脚本第15步中该镜像对应的名称；最后执行该脚本。
  
  5. 如果设置了私有仓库以https的方式访问，则脚本需要从DomeOS Server上下载证书文件 registry.crt，因此当前主机需要访问DomeOS Server。如果不能访问，则将registry.crt文件放置到脚本所在目录，并修改脚本中第10步的"TODO domeos offline"部分。
  
  6. 脚本成功执行后，将以systemctl的形式启动flanneld、docker、kube-proxy、kubelet，将以docker容器形式启动用于监控的agent，将为该结点打上指定的标签。
  
  7. 通过运行stop-k8s-node.sh可摘除node，运行在该节点上的所有容器被停止，docker和flannel也会被停止。
参数说明:

    --api-server: kubernetes集群kube-apiserver服务地址。必需
    --cluster-dns: kubernetes集群内DNS服务地址，与kubernetes master启动参数一致。必需
    --cluster-domain: kubernetes集群内DNS服务的search域，与kubernetes master启动参数一致。必需
    --monitor-transfer: 监控transfer服务地址，可以填多个，各个地址间以逗号分隔。必需
    --docker-graph-path: docker运行时的根路径，容器、本地镜像等会存储在该路径下，占用空间大，建议设置到大容量磁盘上。默认为脚本所在路径下的docker-graph目录
    --docker-log-level: docker daemon的日志级别，可选值debug/info/warn/error/fatal。kubernetes会定时查询所有容器状态，导致docker daemon输出大量info级别日志到系统日志中(/var/log/message)，建议日志级别设置为warn级别以上。默认为warn
    --registry-type: 私有仓库类型，取值为http或https。必需
    --registry-arg: 私有仓库的地址，可以为域名地址。必需
    --domeos-server: DomeOS Server服务地址。当--registry-type为https时必需
    --etcd-server: ETCD集群服务地址，各个地址间以逗号分隔。必需。
    --node-labels: 为node打上的标签，非必需。
  
样例:

    sudo sh start_node_centos.sh --api-server http://10.16.42.200:8080 --cluster-dns 172.16.40.1 --cluster-domain domeos.local --monitor-transfer 10.16.42.198:8433,10.16.42.199:8433 --docker-graph-path /opt/domeos/openxxs/docker-graph --docker-log-level warn --registry-type http --registry-arg 10.11.150.76:5000 --domeos-server 10.11.150.76:8080 --etcd-server http://10.16.42.200:4012 --node-labels TESTENV=HOSTENVTYPE,PRODENV=HOSTENVTYPE
  
测试:

  通过" kubectl --server <kube-apiserver的服务地址> get node "查看集群的node节点状态，如果显示了该结点并且状态为"Ready"，则说明node节点添加成功，如:

    command: kubectl --server 10.16.42.200:8080 get nodes
    result :
    NAME         STATUS    AGE
    tc-151-100   Ready     25d
	
参考:

  Kubernetes官方文档(http://kubernetes.io)
  Docker RPM包下载地址(https://yum.dockerproject.org/repo/main/centos/7/Packages/)

## STEP 10: 创建kubernetes集群内DNS服务

启动方式: kubernetes service形式

配置文件: dns.yaml (http://domeos-script.bjctc.scs.sohucs.com/dns.yaml)

执行文件: kubectl

镜像: pub.domeos.org/domeos/skydns:1.5
      pub.domeos.org/domeos/kube2sky:0.4
	  
命令: 

    kubectl --server <kube-apiserver-addr> create -f dns.yaml

参数说明:

  1. skydns-svc service中的clusterIP为部署时设置的--cluster-dns
  
  2. skydns RC中args下的--machines为ETCD集群的服务地址，各个地址间以逗号分隔，必须带http://前缀
  
  3. skydns RC中args下的--nameservers为集群中的主机使用的外部DNS服务（centos系统中为/etc/resolv.conf下配置的非集群nameserver），带端口号，多个DNS服务则以半角逗号分隔
  
  4. skydns RC中args下的--domain为部署时设置的--cluster-domain
  
  5. kube2sky RC中args下的--etcd-server为ETCD的服务地址，有且仅能设置一个，且必需在--machines设置的集群中，必须带http://前缀
  
  6. kube2sky RC中args下的--domain为部署时设置的--cluster-domain
  
说明:

  1. 创建前请依据具体部署修改配置文件。
  
  2. 执行完毕后将创建名为skydns-svc的service，名为skydns的RC和名为kube2sky的RC。
  
样例:

    kubectl --server 10.16.42.200:8080 create -f dns.yaml
	
测试:

  1. 通过" kubectl --server 10.16.42.200:8080 get svc "获取集群svc列表，确认skydns-svc是否已创建
  
  2. 通过" kubectl --server 10.16.42.200:8080 get pods "获取集群pod列表，确认skydns-为前缀和kube2sky-为前缀的两个pod是否处于Running状态，如skydns-u44ey和kube2sky-2h1b9
  
  3. 查看node上的/etc/resolv.conf文件，确认前两行是否为如下内容（其中的domeos.local为--cluster-domain参数的值，172.16.40.1为--cluster-dns参数的值）:
  
    search default.svc.domeos.local svc.domeos.local domeos.local
    nameserver 172.16.40.1
  
  如果不是，添加如上格式内容
  
  4. 在node上进行DNS解析验证，方式有多种，如" nslookup skydns-svc.default.svc.domeos.local "，如果没安装nslookup也可通过ping间接验证" ping skydns-svc.default.svc.domeos.local -c 1 "解析出IP地址了说明DNS服务创建成功
  
  5. 在通过kubernetes创建的容器内部验证，方法同第4步
  
搜狐云台DomeOS项目组 xiaoshengxu@sohu-inc.com