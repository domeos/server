package org.domeos.framework.api.service.token.impl;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.apache.commons.codec.binary.Base32;
import org.domeos.util.StringUtils;
import org.apache.shiro.codec.Base64;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.AuthTokenException;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.model.token.Token;
import org.domeos.framework.api.model.token.related.RegistryTokenInfo;
import org.domeos.framework.api.model.token.related.ResourceAction;
import org.domeos.framework.api.service.auth.UserService;
import org.domeos.framework.api.service.project.BuildService;
import org.domeos.framework.api.service.token.TokenService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sun.security.util.DerInputStream;
import sun.security.util.DerValue;

import java.io.IOException;
import java.math.BigInteger;
import java.security.*;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.util.*;

/**
 * Created by KaiRen on 16/8/1.
 */
@Service
public class TokenServiceImpl implements TokenService {
    private static Logger logger = LoggerFactory.getLogger(TokenServiceImpl.class);

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    AuthBiz authBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    ProjectBiz projectBiz;

    @Autowired
    private UserService userService;

    @Autowired
    private BuildService buildService;

    @Autowired
    private ProjectCollectionBiz projectCollectionBiz;

    // PKCS#1 format
    private final String PEM_RSA_PRIVATE_START = "-----BEGIN RSA PRIVATE KEY-----";
    private final String PEM_RSA_PRIVATE_END = "-----END RSA PRIVATE KEY-----";
    private final long expiration = 5 * 60 * 1000; //5min in timemills

    public Token getToken(String authorization, String service, String scope, String offline_token, String client_id) {
        Registry curRegistry = globalBiz.getRegistry();
        if (!isAuthUsed(curRegistry)) {
            return null;
        }
        if (authorization == null) {
            if (scope == null) {
                return null;
            }
        }
        String[] auth = authorization.split(" ");
        if (auth.length != 2 || !auth[0].equalsIgnoreCase("basic") || StringUtils.isBlank(auth[1])) {
            throw ApiException.wrapResultStat(ResultStat.AUTH_METHOD_NOT_LEGAL);
        }
        String userpass = new String(org.apache.commons.codec.binary.Base64.decodeBase64(auth[1]));
        String[] userorpass = userpass.split(":");
        if (userorpass.length != 2) {
            throw ApiException.wrapResultStat(ResultStat.AUTH_METHOD_NOT_LEGAL);
        }
        if (StringUtils.equals(auth[1], GlobalConstant.REGISTRY_TOKEN)) {
            String []scopeStr = StringUtils.split(scope, ":");
            if (scopeStr.length != 3) {
                logger.warn("generate token with scope error, current scope is {}", scope);
                return null;
            }
            String imageName = scopeStr[1];
            List<String> pullAccess = new ArrayList<>(1);
            pullAccess.add("pull");
            List<ResourceAction> resourceActions = new ArrayList<>(1);
            resourceActions.add(new ResourceAction("repository", imageName, pullAccess));
            try {
                return generateToken(userorpass[0], curRegistry.getTokenInfo(), resourceActions, null, null);
            } catch (AuthTokenException e) {
                logger.warn("generate token error, message is {}", e.getMessage());
            }
        } else if (userService.loginWithoutType(userorpass[0], userorpass[1])) {
            List<String> scopes = new ArrayList<>(1);
            scopes.add(scope);
            try {
                return generateToken(userorpass[0], curRegistry.getTokenInfo(), getResourceActions(scopes), offline_token, client_id);
            } catch (AuthTokenException e) {
                logger.warn("generate token error, message is {}", e.getMessage());
            }
        } else if (buildService.secretAuthorization(userorpass[0], userorpass[1])) {
            int buildId = Integer.parseInt(userorpass[0]);
            Project project = projectBiz.getProjectByBuildId(buildId);
            List<ResourceAction> resourceActions = new ArrayList<>(1);
            if (scope != null && project != null) {
                String []scopeStr = StringUtils.split(scope, ":");
                if (scopeStr.length != 3) {
                    logger.warn("generate token with scope error, current scope is {}", scope);
                    return null;
                }
                String imageName = scopeStr[1];
                if (imageName.equals(project.getName())) {
                    List<String> pushAccess = new ArrayList<>(3);
                    pushAccess.add("pull");
                    pushAccess.add("push");
                    pushAccess.add("*");
                    resourceActions.add(new ResourceAction("repository", imageName, pushAccess));
                } else {
                    List<String> pullAccess = new ArrayList<>(1);
                    pullAccess.add("pull");
                    resourceActions.add(new ResourceAction("repository", imageName, pullAccess));
                }
            }
            try {
                return generateToken(userorpass[0], curRegistry.getTokenInfo(), resourceActions, null, null);
            } catch (AuthTokenException e) {
                logger.warn("generate token error, message is {}", e.getMessage());
            }

        }
        return null;
    }

    @Override
    public String getCurrentUserToken(String name, String type) {
        Registry curRegistry = globalBiz.getRegistry();
        if (!isAuthUsed(curRegistry)) {
            return null;
        }
        List<ResourceAction> resourceActions = new ArrayList<>(1);
        ResourceAction resourceAction = new ResourceAction();
        resourceAction.setType("repository");
        resourceAction.setName(name);
        List<String> actions = new LinkedList<>();
        if (type.equalsIgnoreCase("pull")) {
            actions.add("pull");
        } else if (type.equalsIgnoreCase("push")) {
            actions.add("pull");
            actions.add("push");
            actions.add("*");
        }
        resourceAction.setActions(actions);
        resourceActions.add(resourceAction);
        try {
            Token token = generateToken(CurrentThreadInfo.getUserName(), curRegistry.getTokenInfo(), resourceActions, "", "");
            if (token != null) {
                return token.getToken();
            }
        } catch (AuthTokenException e) {
            logger.warn("generate admin token error, message is {}", e.getMessage());
        }
        return null;
    }

    @Override
    public String getCatalogToken() {
        Registry curRegistry = globalBiz.getRegistry();
        if (!isAuthUsed(curRegistry)) {
            return null;
        }
        List<String> access = new ArrayList<>(1);
        access.add("*");
        ResourceAction resourceAction = new ResourceAction("registry", "catalog", access);
        List<ResourceAction> resourceActions = new ArrayList<>(1);
        resourceActions.add(resourceAction);
        try {
            Token token = generateToken("domeos", curRegistry.getTokenInfo(), resourceActions, null, null);
            if (token != null) {
                return token.getToken();
            }
        } catch (AuthTokenException e) {
            logger.warn("generate admin token error, message is {}", e.getMessage());
        }
        return null;
    }

    @Override
    public String getAdminToken(String imageName) {
        Registry curRegistry = globalBiz.getRegistry();
        if (!isAuthUsed(curRegistry)) {
            return null;
        }
        List<String> access = new ArrayList<>(1);
        access.add("*");
        ResourceAction resourceAction = new ResourceAction("repository", imageName, access);
        List<ResourceAction> resourceActions = new ArrayList<>(1);
        resourceActions.add(resourceAction);
        try {
            Token token = generateToken("domeos", curRegistry.getTokenInfo(), resourceActions, null, null);
            if (token != null) {
                return token.getToken();
            } else {
                return null;
            }
        } catch (AuthTokenException e) {
            logger.warn("generate admin token error, imagename is {}, message is {}", imageName, e.getMessage());
        }
        return null;
    }

    private Token generateToken(String subject, RegistryTokenInfo tokenInfo, List<ResourceAction> resourceActions, String offline_token, String client_id)
            throws AuthTokenException {
        String privateKeyStr = tokenInfo.getPrivate_key();
        try {
            PrivateKey privateKey = pemFileLoadPrivateKeyPkcs1OrPkcs8Encoded(privateKeyStr);
            Map<String, Object> jwtHeaders = new HashMap<>();
            jwtHeaders.put("typ", "JWT");
            jwtHeaders.put("alg", "RS256");
            jwtHeaders.put("kid", generateKeyID(privateKeyStr));

            DateTime now = new DateTime();

            Date curTime = new Date();
            Date expiredTime = new Date(curTime.getTime() + expiration);
            Date startTime = new Date(curTime.getTime() - expiration);
            String token = Jwts.builder().signWith(SignatureAlgorithm.forName("RS256"), privateKey).setHeader(jwtHeaders)
                    .setIssuer(tokenInfo.getIssuer()).setSubject(subject)
                    .setAudience(tokenInfo.getService()).setExpiration(expiredTime).setNotBefore(startTime)
                    .setIssuedAt(startTime).setId(generateJWTID(16)).claim("access", resourceActions).compact();
            return new Token(token, expiration / 1000, now.toDateTime(DateTimeZone.UTC).toString());

        } catch (NoSuchAlgorithmException ex) {
            throw new AuthTokenException("Can not find the method.");
        } catch (GeneralSecurityException ex) {
            throw new AuthTokenException("Could not parse a PKCS1 private key");
        } catch (AuthTokenException ex) {
            throw ex;
        }
    }

    private String generateKeyID(String privateKeyPem) throws GeneralSecurityException, AuthTokenException {
        privateKeyPem = privateKeyPem.replace(PEM_RSA_PRIVATE_START, "").replace(PEM_RSA_PRIVATE_END, "");
        privateKeyPem = privateKeyPem.replaceAll("\\s", "");

        BigInteger modulus = null;
        BigInteger publicExp = null;
        try {
            DerInputStream derReader = new DerInputStream(Base64.decode(privateKeyPem));

            DerValue[] seq = derReader.getSequence(0);

            if (seq.length < 9) {
                throw new GeneralSecurityException("Could not parse a PKCS1 private key.");
            }

            // skip version seq[0];
            modulus = seq[1].getBigInteger();
            publicExp = seq[2].getBigInteger();
        } catch (IOException e) {
            throw new AuthTokenException("Get ioexception when generate key id, excepiton is:" + e);
        }

        RSAPublicKeySpec pkeySpec = new RSAPublicKeySpec(modulus, publicExp);
        KeyFactory factory = KeyFactory.getInstance("RSA");
        PublicKey publicKey = factory.generatePublic(pkeySpec);
        byte[] derEncode = publicKey.getEncoded();
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        messageDigest.update(derEncode);
        byte[] shaEncode = messageDigest.digest();
        Base32 base32 = new Base32();

        String base32Encode = base32.encodeAsString(shaEncode);
        StringBuilder kid = new StringBuilder(base32Encode.substring(0, 4));
        for (int i = 1; i < 12; i++) {
            kid.append(":").append(base32Encode.substring(4 * i, 4 * (i + 1)));
        }
        return kid.toString();
    }

    private String generateJWTID(int length) {    //A JWT ID is
        String str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder buf = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int num = random.nextInt(62);
            buf.append(str.charAt(num));
        }
        return buf.toString();
    }


    private PrivateKey pemFileLoadPrivateKeyPkcs1OrPkcs8Encoded(String privateKeyPem) throws GeneralSecurityException, AuthTokenException {
        if (privateKeyPem.contains(PEM_RSA_PRIVATE_START)) {  // PKCS#1 format

            privateKeyPem = privateKeyPem.replace(PEM_RSA_PRIVATE_START, "").replace(PEM_RSA_PRIVATE_END, "");
            privateKeyPem = privateKeyPem.replaceAll("\\s", "");

            try {
                DerInputStream derReader = new DerInputStream(Base64.decode(privateKeyPem));

                DerValue[] seq = derReader.getSequence(0);

                if (seq.length < 9) {
                    throw new GeneralSecurityException("Could not parse a PKCS1 private key.");
                }

                // skip version seq[0];
                BigInteger modulus = seq[1].getBigInteger();
                BigInteger publicExp = seq[2].getBigInteger();
                BigInteger privateExp = seq[3].getBigInteger();
                BigInteger prime1 = seq[4].getBigInteger();
                BigInteger prime2 = seq[5].getBigInteger();
                BigInteger exp1 = seq[6].getBigInteger();
                BigInteger exp2 = seq[7].getBigInteger();
                BigInteger crtCoef = seq[8].getBigInteger();

                RSAPrivateCrtKeySpec keySpec = new RSAPrivateCrtKeySpec(modulus, publicExp, privateExp, prime1, prime2, exp1, exp2, crtCoef);
                KeyFactory factory = KeyFactory.getInstance("RSA");
                return factory.generatePrivate(keySpec);
            } catch (IOException e) {
                throw new AuthTokenException("Get ioexception when generate key id, excepiton is:" + e);
            }
        }

        throw new GeneralSecurityException("Not supported format of a private key");
    }

    private List<ResourceAction> getResourceActions(List<String> scopes) {
        if (scopes == null || scopes.isEmpty()) {
            return new ArrayList<>(1);
        }
        List<ResourceAction> accessActions = new ArrayList<>(scopes.size());
        for (String scope : scopes) {
            if (StringUtils.isBlank(scope)) {
                continue;
            }
            String items[] = scope.split(":");
            if (!items[0].equalsIgnoreCase("repository")) {
                continue;
            }
            ResourceAction resourceAction = new ResourceAction();
            resourceAction.setType(items[0]);
            if (items.length > 1) {
                resourceAction.setName(items[1]);
            } else {
                resourceAction.setName("");
            }
            if (items.length > 2) {
                List<String> actionList = getImageAuthority(items[1]);
                resourceAction.setActions(actionList);
            }
            accessActions.add(resourceAction);
        }
        return accessActions;
    }

    private List<String> getImageAuthority(String imageName) {
        int userId = CurrentThreadInfo.getUserId();
        List<String> ret = new ArrayList<>();
        if (userId < 0) {
            return ret;
        }
        if (StringUtils.isBlank(imageName)) {
            return ret;
        }
        if (AuthUtil.isAdmin(userId)) {
            ret.add("*");
            ret.add("push");
            ret.add("pull");
            return ret;
        }

        String collectionName = imageName.split("/")[0];
        ProjectCollection projectCollection = projectCollectionBiz.getProjectCollectionByName(collectionName);
        if (projectCollection == null) {
            return ret;
        }
        try {
            AuthUtil.collectionVerify(userId, projectCollection.getId(), ResourceType.PROJECT_COLLECTION, OperationType.SET, -1);
            ret.add("push");
            ret.add("pull");
            return ret;
        } catch (PermitException e) {
            try {
                AuthUtil.collectionVerify(userId, projectCollection.getId(), ResourceType.PROJECT_COLLECTION, OperationType.GET, -1);
                ret.add("pull");
            } catch (PermitException e1) {
                // this exception can be
            }
        }
//        Project project = projectBiz.getProjectByName(imageName);
//        if (project != null) {
//            try {
//                AuthUtil.verify(CurrentThreadInfo.getUserId(), project.getId(), ResourceType.PROJECT, OperationType.SET);
//                ret.add("push");
//                ret.add("pull");
//                return ret;
//            } catch (PermitException e) {
//                try {
//                    getAble = AuthUtil.verify(CurrentThreadInfo.getUserId(), project.getId(), ResourceType.PROJECT, OperationType.GET);
//                } catch (PermitException e1) {
//                    //this exception can be ignored.
//                }
//            }
//        }
        return ret;
    }

    @Override
    public Boolean isAuthUsed(Registry registry) {
        return registry != null && registry.getTokenInfo() != null;
    }
}
