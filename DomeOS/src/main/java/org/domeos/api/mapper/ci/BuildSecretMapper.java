package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.api.model.ci.BuildSecret;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/12/2.
 */
@Repository
public interface BuildSecretMapper {
    @Insert("INSERT INTO build_secret (buildId, secret) VALUES (#{buildId}, #{secret})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addBuildSecret(BuildSecret buildSecret);

    @Select("SELECT * FROM build_secret WHERE buildId = #{buildId}")
    BuildSecret getBuildSecretByBuildId(@Param("buildId") int buildId);
}
