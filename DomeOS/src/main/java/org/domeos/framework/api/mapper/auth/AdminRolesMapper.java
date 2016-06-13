package org.domeos.framework.api.mapper.auth;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.auth.AdminRole;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Repository
public interface AdminRolesMapper {
    @Select("SELECT * FROM admin_roles WHERE userId=#{userId}")
    AdminRole getAdminById(@Param("userId") long userId);
}
