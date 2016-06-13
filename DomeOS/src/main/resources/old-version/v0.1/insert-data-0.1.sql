-- add admin
-- use domeos;
insert into sys_users(username, password, salt, login_type, create_time, status) VALUES ('admin','5fdf2372d4f23bdecfd2b8e8d7aacce1','0ea3abcf42700bb1bbcca6c27c92a821','USER','2015-11-19 16:20:55','NORMAL');
insert into sys_admin_roles(role) VALUES ('admin');
insert into global(type, value) VALUES ('BUILD_IMAGE', 'pub.domeos.org/domeos/build:0.1');