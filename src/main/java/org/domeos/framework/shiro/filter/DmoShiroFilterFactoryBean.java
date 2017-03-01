package org.domeos.framework.shiro.filter;

import org.apache.shiro.config.Ini;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.util.CollectionUtils;
import org.apache.shiro.util.Nameable;
import org.apache.shiro.util.StringUtils;
import org.apache.shiro.web.filter.AccessControlFilter;
import org.apache.shiro.web.filter.authc.AuthenticationFilter;
import org.apache.shiro.web.filter.authz.AuthorizationFilter;
import org.apache.shiro.web.filter.mgt.DefaultFilterChainManager;
import org.apache.shiro.web.filter.mgt.FilterChainManager;
import org.apache.shiro.web.filter.mgt.PathMatchingFilterChainResolver;
import org.apache.shiro.web.mgt.WebSecurityManager;
import org.apache.shiro.web.servlet.AbstractShiroFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanInitializationException;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.config.BeanPostProcessor;

import javax.servlet.Filter;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Created by feiliu206363 on 2017/2/7.
 */
public class DmoShiroFilterFactoryBean implements FactoryBean, BeanPostProcessor {
    private static final transient Logger log = LoggerFactory.getLogger(DmoShiroFilterFactoryBean.class);
    private SecurityManager securityManager;
    private Map<String, Filter> filters = new LinkedHashMap();
    private Map<String, String> filterChainDefinitionMap = new LinkedHashMap();
    private String loginUrl;
    private String successUrl;
    private String unauthorizedUrl;
    private AbstractShiroFilter instance;

    public DmoShiroFilterFactoryBean() {
    }

    public SecurityManager getSecurityManager() {
        return this.securityManager;
    }

    public void setSecurityManager(SecurityManager securityManager) {
        this.securityManager = securityManager;
    }

    public String getLoginUrl() {
        return this.loginUrl;
    }

    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }

    public String getSuccessUrl() {
        return this.successUrl;
    }

    public void setSuccessUrl(String successUrl) {
        this.successUrl = successUrl;
    }

    public String getUnauthorizedUrl() {
        return this.unauthorizedUrl;
    }

    public void setUnauthorizedUrl(String unauthorizedUrl) {
        this.unauthorizedUrl = unauthorizedUrl;
    }

    public Map<String, Filter> getFilters() {
        return this.filters;
    }

    public void setFilters(Map<String, Filter> filters) {
        this.filters = filters;
    }

    public Map<String, String> getFilterChainDefinitionMap() {
        return this.filterChainDefinitionMap;
    }

    public void setFilterChainDefinitionMap(Map<String, String> filterChainDefinitionMap) {
        this.filterChainDefinitionMap = filterChainDefinitionMap;
    }

    public void setFilterChainDefinitions(String definitions) {
        Ini ini = new Ini();
        ini.load(definitions);
        Ini.Section section = ini.getSection("urls");
        if (CollectionUtils.isEmpty(section)) {
            section = ini.getSection("");
        }

        this.setFilterChainDefinitionMap(section);
    }

    public Object getObject() throws Exception {
        if (this.instance == null) {
            this.instance = this.createInstance();
        }

        return this.instance;
    }

    public Class getObjectType() {
        return JsessionIdAvoidFilter.class;
    }

    public boolean isSingleton() {
        return true;
    }

    protected FilterChainManager createFilterChainManager() {
        DefaultFilterChainManager manager = new DefaultFilterChainManager();
        Map defaultFilters = manager.getFilters();
        Iterator filters = defaultFilters.values().iterator();

        while (filters.hasNext()) {
            Filter chains = (Filter) filters.next();
            this.applyGlobalPropertiesIfNecessary(chains);
        }

        Map filters1 = this.getFilters();
        String entry;
        Filter url;
        if (!CollectionUtils.isEmpty(filters1)) {
            for (Iterator chains1 = filters1.entrySet().iterator(); chains1.hasNext(); manager.addFilter(entry, url, false)) {
                Map.Entry i$ = (Map.Entry) chains1.next();
                entry = (String) i$.getKey();
                url = (Filter) i$.getValue();
                this.applyGlobalPropertiesIfNecessary(url);
                if (url instanceof Nameable) {
                    ((Nameable) url).setName(entry);
                }
            }
        }

        Map chains2 = this.getFilterChainDefinitionMap();
        if (!CollectionUtils.isEmpty(chains2)) {
            Iterator i$1 = chains2.entrySet().iterator();

            while (i$1.hasNext()) {
                Map.Entry entry1 = (Map.Entry) i$1.next();
                String url1 = (String) entry1.getKey();
                String chainDefinition = (String) entry1.getValue();
                manager.createChain(url1, chainDefinition);
            }
        }

        return manager;
    }

    protected AbstractShiroFilter createInstance() throws Exception {
        log.debug("Creating Shiro Filter instance.");
        SecurityManager securityManager = this.getSecurityManager();
        String manager1;
        if (securityManager == null) {
            manager1 = "SecurityManager property must be set.";
            throw new BeanInitializationException(manager1);
        } else if (!(securityManager instanceof WebSecurityManager)) {
            manager1 = "The security manager does not implement the WebSecurityManager interface.";
            throw new BeanInitializationException(manager1);
        } else {
            FilterChainManager manager = this.createFilterChainManager();
            PathMatchingFilterChainResolver chainResolver = new PathMatchingFilterChainResolver();
            chainResolver.setFilterChainManager(manager);
            return new JsessionIdAvoidFilter((WebSecurityManager) securityManager, chainResolver);
        }
    }

    private void applyLoginUrlIfNecessary(Filter filter) {
        String loginUrl = this.getLoginUrl();
        if (StringUtils.hasText(loginUrl) && filter instanceof AccessControlFilter) {
            AccessControlFilter acFilter = (AccessControlFilter) filter;
            String existingLoginUrl = acFilter.getLoginUrl();
            if ("/login.jsp".equals(existingLoginUrl)) {
                acFilter.setLoginUrl(loginUrl);
            }
        }

    }

    private void applySuccessUrlIfNecessary(Filter filter) {
        String successUrl = this.getSuccessUrl();
        if (StringUtils.hasText(successUrl) && filter instanceof AuthenticationFilter) {
            AuthenticationFilter authcFilter = (AuthenticationFilter) filter;
            String existingSuccessUrl = authcFilter.getSuccessUrl();
            if ("/".equals(existingSuccessUrl)) {
                authcFilter.setSuccessUrl(successUrl);
            }
        }

    }

    private void applyUnauthorizedUrlIfNecessary(Filter filter) {
        String unauthorizedUrl = this.getUnauthorizedUrl();
        if (StringUtils.hasText(unauthorizedUrl) && filter instanceof AuthorizationFilter) {
            AuthorizationFilter authzFilter = (AuthorizationFilter) filter;
            String existingUnauthorizedUrl = authzFilter.getUnauthorizedUrl();
            if (existingUnauthorizedUrl == null) {
                authzFilter.setUnauthorizedUrl(unauthorizedUrl);
            }
        }

    }

    private void applyGlobalPropertiesIfNecessary(Filter filter) {
        this.applyLoginUrlIfNecessary(filter);
        this.applySuccessUrlIfNecessary(filter);
        this.applyUnauthorizedUrlIfNecessary(filter);
    }

    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof Filter) {
            log.debug("Found filter chain candidate filter \'{}\'", beanName);
            Filter filter = (Filter) bean;
            this.applyGlobalPropertiesIfNecessary(filter);
            this.getFilters().put(beanName, filter);
        } else {
            log.trace("Ignoring non-Filter bean \'{}\'", beanName);
        }

        return bean;
    }

    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        return bean;
    }
}
