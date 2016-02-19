package org.domeos.user.service;

import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.realm.ldap.JndiLdapContextFactory;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.*;
import javax.naming.ldap.LdapContext;
import java.util.Hashtable;

/**
 * Created by zhenfengchen on 15-12-3.
 */
public class OpenLdapTest {
    final static String user_default_password = "test";
    final static String domainName = "dc=maxcrc,dc=com";
    final static String userRootDn = "ou=developer,dc=maxcrc,dc=com";

    public static int UF_NORMAL_ACCOUNT = 0x0200;
    public static int UF_PASSWORD_EXPIRED = 0x800000;
    public static int UF_DONT_EXPIRE_PASSWD = 0x10000;

    public static void main(String[] args) {
        testSohuLDAP();
    }

    public static DirContext ctx = null;

    public static void Init() {
        String rootDN =  "dc=maxcrc,dc=com" ;
        Hashtable env =  new  Hashtable();
        env.put(Context.INITIAL_CONTEXT_FACTORY,  "com.sun.jndi.ldap.LdapCtxFactory" );
//        env.put(Context.PROVIDER_URL,  "ldap://localhost/"  + rootDN);
        env.put(Context.PROVIDER_URL,  "ldap://localhost");
        env.put(Context.SECURITY_AUTHENTICATION,  "simple" );
        env.put(Context.SECURITY_PRINCIPAL,  "cn=Manager,dc=maxcrc,dc=com" );
        env.put(Context.SECURITY_CREDENTIALS,  "secret" );
        DirContext ctx =  null ;
        try  {
            ctx =  new InitialDirContext(env);
//            ctx.search("zhenfengchen");
            System.out.println("认证成功");

            SearchControls constraints = new SearchControls();
            constraints.setSearchScope(SearchControls.SUBTREE_SCOPE);

//            String searchPath = "ou=developer";
            String searchPath = "ou=developer,dc=maxcrc,dc=com";
            String userName = "zhenfengchen";
            NamingEnumeration results = ctx.search(searchPath, "cn="
                + userName, constraints);
            System.out.println("=============");
        } catch  (javax.naming.AuthenticationException e) {
            e.printStackTrace();
            System.out.println( "认证失败" );
        } catch  (Exception e) {
            System.out.println( "认证出错：" );
            e.printStackTrace();
        }
    }

    public static void Close() {
        if  (ctx !=  null ) {
            try {
                ctx.close();
            } catch  (NamingException e) {
                //ignore
            }
        }
    }


    public static void testSohuLDAP() {
        Hashtable env =  new  Hashtable();
        env.put(Context.INITIAL_CONTEXT_FACTORY,  "com.sun.jndi.ldap.LdapCtxFactory" );
        env.put(Context.PROVIDER_URL,  "ldap://ldap.sohu-inc.com:389");
        env.put(Context.SECURITY_AUTHENTICATION,  "simple" );
        String principal = "zhenfengchen@sohu-inc.com";
        String credentials = "xxxxxxxx";
        env.put(Context.SECURITY_PRINCIPAL,  principal);
        env.put(Context.SECURITY_CREDENTIALS,  credentials);
        DirContext ctx =  null ;
        try  {
            ctx =  new InitialDirContext(env);
            System.out.println("认证成功");

            JndiLdapContextFactory ldapContextFactory = new JndiLdapContextFactory();
            ldapContextFactory.setUrl("ldap://ldap.sohu-inc.com:389");
            try {
                 LdapContext ctx2 = ldapContextFactory.getLdapContext(principal,
                        credentials);
                SimpleAuthenticationInfo res = new SimpleAuthenticationInfo(principal, credentials, "aa");
                System.out.println(res.getCredentials());
            } catch (NamingException e) {
                throw new IncorrectCredentialsException();
            }

            System.out.println("=============");
        } catch  (javax.naming.AuthenticationException e) {
            e.printStackTrace();
            System.out.println( "认证失败" );
        } catch  (Exception e) {
            System.out.println( "认证出错：" );
            e.printStackTrace();
        }

        if  (ctx !=  null ) {
            try {
                ctx.close();
            } catch  (NamingException e) {
                //ignore
            }
        }
    }

    //
    public static void test1() {
//        String rootDN =  "dc=maxcrc,dc=com" ;
        Hashtable env =  new  Hashtable();
        env.put(Context.INITIAL_CONTEXT_FACTORY,  "com.sun.jndi.ldap.LdapCtxFactory" );
//        env.put(Context.PROVIDER_URL,  "ldap://localhost/"  + rootDN);
        env.put(Context.PROVIDER_URL,  "ldap://localhost");
        env.put(Context.SECURITY_AUTHENTICATION,  "simple" );
        env.put(Context.SECURITY_PRINCIPAL,  "cn=Manager,dc=maxcrc,dc=com" );
        env.put(Context.SECURITY_CREDENTIALS,  "secret" );
        DirContext ctx =  null ;
        try  {
            ctx =  new InitialDirContext(env);
//            ctx.search("zhenfengchen");
            System.out.println("认证成功");

            SearchControls constraints = new SearchControls();
            constraints.setSearchScope(SearchControls.SUBTREE_SCOPE);

            String searchPath = "ou=developer,dc=maxcrc,dc=com";
            String userName = "zhenfengchen";
            NamingEnumeration results = ctx.search(searchPath, "cn="
                + userName, constraints);
            System.out.println("=============");
        } catch  (javax.naming.AuthenticationException e) {
            e.printStackTrace();
            System.out.println( "认证失败" );
        } catch  (Exception e) {
            System.out.println( "认证出错：" );
            e.printStackTrace();
        }

        if  (ctx !=  null ) {
            try {
                ctx.close();
            } catch  (NamingException e) {
                //ignore
            }
        }
    }
}
