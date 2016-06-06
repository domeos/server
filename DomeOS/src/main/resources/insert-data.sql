-- add admin
-- use domeos;
INSERT INTO users(username, password, salt, loginType, createTime, state) VALUES ('admin','5fdf2372d4f23bdecfd2b8e8d7aacce1','0ea3abcf42700bb1bbcca6c27c92a821','USER','1460017181','NORMAL');
INSERT INTO admin_roles(userId, role) VALUES ('1', 'admin');
INSERT INTO global(type, value) VALUES ('BUILD_IMAGE', 'pub.domeos.org/domeos/build:0.3');
INSERT INTO global(type, value) VALUES ('PUBLIC_REGISTRY_URL', 'http://pub.domeos.org');