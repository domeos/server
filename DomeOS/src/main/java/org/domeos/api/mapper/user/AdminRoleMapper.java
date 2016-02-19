package org.domeos.api.mapper.user;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.api.model.user.AdminRole;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2016/1/6.
 */
@Repository
public interface AdminRoleMapper {
    @Select("SELECT * FROM sys_admin_roles WHERE user_id=#{userId}")
    AdminRole getAdminById(@Param("userId") long userId);
}
