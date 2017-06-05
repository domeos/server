
DomeOS：企业级私有云一站式运维管理系统
=========
DomeOS是搜狐北京研发中心打造的一款基于Docker的企业级应用编排运维管理系统。
我们致力于研究以Docker为代表的容器技术，为企业级用户打造全流程标准化的自动运维平台。
DomeOS覆盖了企业用户从代码编译打包，到部署运维的整个工作流程，具体功能包含关联代码仓库、持续集成、应用版本管理、升级回滚、扩容缩容、监控报警等。
此外，为了满足企业级用户对于用户管理、权限管理和资源管理的需求，DomeOS提供了LDAP对接、权限管理、集群管理、镜像管理等贴近企业用户使用场景的功能。
DomeOS采用私有云模式，部署在用户的内网上，确保环境安全可靠。

版本更新
=========
版本更新信息请查看：[版本更新记录](https://github.com/domeos/server/releases)

使用指南
=========
DomeOS需要Mysql存储相关信息[配置说明](https://github.com/domeos/server/tree/master/DomeOS)，
其他组件包括Docker、Flannel、Kubernetes、监控（整合open-falcon和cadvisor）、WebSSH。
目前支持的部署环境为内核版本3.10以上的Centos7和ubuntu 12.04、14.04、15.10、16.04。
可以通过[一键安装脚本](http://domeos.org/download/)快速体验DomeOS，详细介绍请参考[DomeOS说明文档]
(http://gitbook.domeos.org)

Licensing
=========
Domeos is licensed under the Apache License, Version 2.0. See
[LICENSE](https://github.com/domeos/server/blob/master/LICENSE) for the full
license text.

联系我们
=========
QQ交流群：257691628
欢迎加入我们
