package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.RSAKeyPair;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/20.
 */
@Repository
public interface RSAKeyPairMapper {
    @Select("SELECT * FROM rsa_keypair WHERE id = #{id}")
    RSAKeyPair getRSAKeyPairById(@Param("id") int id);

    @Insert("INSERT INTO rsa_keypair (projectId, keyId, privateKey, publicKey, fingerPrint) values (" +
            "#{projectId}, #{keyId}, #{privateKey}, #{publicKey}, #{fingerPrint})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addRSAKeyPair(RSAKeyPair keyPair);

    @Select("SELECT * FROM rsa_keypair WHERE projectId = #{projectId}")
    RSAKeyPair getRSAKeyPairByProjectId(@Param("projectId") int projectId);

    @Select("SELECT * FROM rsa_keypair WHERE keyId = #{keyId} LIMIT 1")
    RSAKeyPair getRSAKeyPairByKeyId(@Param("keyId") int keyId);

    @Update("UPDATE rsa_keypair SET projectId=#{projectId}, privateKey=#{privateKey}, publicKey=#{publicKey}, fingerPrint=#{fingerPrint}")
    int updateRSAKeyPair(RSAKeyPair rsaKeyPair);

    @Update("UPDATE rsa_keypair SET keyId = #{0.keyId}, privateKey=#{0.privateKey}, publicKey=#{0.publicKey}, fingerPrint=#{0.fingerPrint} WHERE keyId=#{oldKeyId}")
    int updateExtraRSAKeyPair (RSAKeyPair rsaKeyPair, @Param("oldKeyId") int oldKeyId);

    @Delete("DELETE FROM rsa_keypair WHERE projectId=#{projectId}")
    int deleteRSAKeyPairByProjectId(@Param("projectId") int projectId);


}
