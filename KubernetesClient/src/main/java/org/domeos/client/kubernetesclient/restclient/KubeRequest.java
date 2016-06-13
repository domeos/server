package org.domeos.client.kubernetesclient.restclient;
/**
 * Created by anningluo on 15-11-24.
 */

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.*;
import org.apache.http.client.methods.*;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.entity.BufferedHttpEntity;
import org.apache.http.entity.ByteArrayEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.definitions.unversioned.Status;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.responsehandler.RestClientResponseHandler;
import org.domeos.client.kubernetesclient.responsehandler.UnitInputStreamResponseHandler;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;
import org.domeos.client.kubernetesclient.unitstream.factory.ClosableUnitInputStreamFactory;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public abstract class KubeRequest {
    protected HttpEntity entity;
    protected HttpHead header;
    protected URIBuilder uriBuilder;
    protected List<NameValuePair> parameter;
    private KubeRESTClient client;
    protected HttpRequestBase realRequest;
    // protected HttpContext context;
    private static ObjectMapper objectMapper = initObjectMapper();
    protected static Logger logger = Logger.getLogger(KubeRequest.class);

    private static ObjectMapper initObjectMapper() {
        ObjectMapper tmpObjectMapper = new ObjectMapper();
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        tmpObjectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // tmpObjectMapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
        return tmpObjectMapper;
    }

    KubeRequest(KubeRESTClient client, HttpContext context) {
        this.client = client;
        entity = null;
        header = new HttpHead();
        uriBuilder = new URIBuilder();
        parameter = new LinkedList<NameValuePair>();
        scheme("http");
    }
    protected abstract KubeRequest build() throws URISyntaxException;

    public static KubeGetRequest get(KubeRESTClient client, HttpContext context) {
        return new KubeGetRequest(client, context);
    }
    public static KubePostRequest post(KubeRESTClient client, HttpContext context) {
        return new KubePostRequest(client, context);
    }
    public static KubePutRequest put(KubeRESTClient client, HttpContext context) {
        return new KubePutRequest(client, context);
    }
    public static KubeDeleteRequest delete(KubeRESTClient client, HttpContext context) {
        return new KubeDeleteRequest(client, context);
    }
    public static KubePatchRequest patch(KubeRESTClient client, HttpContext context) {
        return new KubePatchRequest(client, context);
    }
    public static KubeOptionsRequest options(KubeRESTClient client, HttpContext context) {
        return new KubeOptionsRequest(client, context);
    }
    public KubeRequest path(String path) {
        uriBuilder.setPath(path);
        return this;
    }
    public KubeRequest scheme(String scheme) {
        uriBuilder.setScheme(scheme);
        return this;
    }
    public KubeRequest addParameter(String key, String value) {
        if (key == null || key.isEmpty()) {
            return this;
        }
        uriBuilder.addParameter(key, value);
        return this;
    }
    public KubeRequest addParameter(NameValuePair parameter) {
        if (parameter == null) {
            return this;
        }
        uriBuilder.addParameter(parameter.getName(), parameter.getValue());
        return this;
    }
    public KubeRequest addParameters(Map<String, String> keyValues) {
        if (keyValues == null) {
            return this;
        }
        Iterator<Map.Entry<String, String>> iter = keyValues.entrySet().iterator();
        List<NameValuePair> parameters = new LinkedList<NameValuePair>();
        while (iter.hasNext()) {
            Map.Entry<String, String> entry = iter.next();
            parameters.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
        }
        uriBuilder.addParameters(parameters);
        return this;
    }
    public KubeRequest addParameters(List<NameValuePair> parameters) {
        if (parameters == null) {
            return this;
        }
        uriBuilder.setParameters(parameters);
        return this;
    }
    public KubeRequest addHeader(String name, String value) {
        if (name == null || name.isEmpty()) {
            return this;
        }
        header.addHeader(name, value);
        return this;
    }
    public KubeRequest addHeader(Header header) {
        if (header == null) {
            return this;
        }
        this.header.addHeader(header);
        return this;
    }
    public KubeRequest addHeaders(List<Header> headers) {
        if (headers == null) {
            return this;
        }
        for (Header header : headers) {
            this.header.addHeader(header);
        }
        return this;
    }
    public KubeRequest body(Object body) throws KubeInternalErrorException {
        if (body == null) {
            return this;
        }
        byte[] bodyData = null;
        try {
            bodyData = objectMapper.writeValueAsBytes(body);
        } catch (JsonProcessingException e) {
            logger.fatal("parse request body failed");
            throw new KubeInternalErrorException("parse request body failed");
        }
        entity = new ByteArrayEntity(bodyData, ContentType.APPLICATION_JSON);
        return this;
    }
    public KubeRequest host(String host) {
        uriBuilder.setHost(host);
        return this;
    }
    public KubeRequest user(String user) {
        uriBuilder.setUserInfo(user);
        return this;
    }
    public KubeRequest port(int port) {
        uriBuilder.setPort(port);
        return this;
    }
    public <T> T query(Class<T> classType)
            throws IOException, KubeResponseException, KubeInternalErrorException {
        // build
        HttpHost target = new HttpHost(uriBuilder.getHost(), uriBuilder.getPort());
        if (realRequest == null) {
            try {
                build();
            } catch (URISyntaxException e) {
                logger.fatal("url syntax error, uriBuilder=" + uriBuilder.toString());
                throw new KubeInternalErrorException("build uri failed, messge=" + e.getMessage(),
                        e.getCause());
            }
        }
        if (realRequest == null) {
            logger.fatal("http request not build");
            throw new KubeInternalErrorException("unknow reason, httpRequest is null");
        }
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== request to " + target.toString() + " ====\n"
                    + KubeRequestHelper.getFullStringOf(realRequest, "\t"));
        }

        // request
        CloseableHttpResponse response = client.Do(target, realRequest);
        logger.debug("======== EXECUTE DONE BEFORE RESPONSE ========");
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== response ====\n"
                    + KubeRequestHelper.getFullStringOf(response, "\t"));
        }
        logger.debug("======== BEFORE HANDLE START ========");

        // handle error
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode == 404) {
            response.close();
            return null;
        } else if (statusCode / 100 != 2) {
            Status errStatus = null;
            try {
                errStatus = objectMapper.readValue(response.getEntity().getContent(), Status.class);
            } finally {
                response.close();
            }
            throw new KubeResponseException(statusCode, errStatus);
        }

        // parse
        T result;
        try {
            result = objectMapper.readValue(response.getEntity().getContent(), classType);
        } catch (JsonParseException e) {
            throw new KubeInternalErrorException("parse response body failed, message=" + e.getMessage(),
                    e.getCause());
        } catch (JsonMappingException e) {
            throw new KubeInternalErrorException("mapping response body field failed, message="
                    + e.getMessage(), e.getCause());
        } finally {
            response.close();
        }
        return result;
    }

     public <T> void queryWithResponseHandler(ClosableUnitInputStreamFactory<T> factory,
                                              UnitInputStreamResponseHandler<T> handler)
            throws IOException, KubeResponseException, KubeInternalErrorException {
        // build
        HttpHost target = new HttpHost(uriBuilder.getHost(), uriBuilder.getPort());
        if (realRequest == null) {
            try {
                build();
            } catch (URISyntaxException e) {
                logger.fatal("url syntax error, uriBuilder=" + uriBuilder.toString());
                throw new KubeInternalErrorException("build uri failed, messge=" + e.getMessage(),
                        e.getCause());
            }
        }
        if (realRequest == null) {
            logger.fatal("http request not build");
            throw new KubeInternalErrorException("unknow reason, httpRequest is null");
        }
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== request to " + target.toString() + " ====\n"
                    + KubeRequestHelper.getFullStringOf(realRequest, "\t"));
        }

        RestClientResponseHandler<T> restHandler = new RestClientResponseHandler<>(factory, handler, this.realRequest);
        // request
        Status status = client.Do(target, realRequest, restHandler);
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== status after response handler ====\n"
                    + status);
        }
        if (status != null) {
            throw new KubeResponseException(status.getCode(), status);
        }
        return;
    }

    // deprecated
    public <T> ClosableUnitInputStream<T> queryWithInputStreamResponse(Class<? extends ClosableUnitInputStream<T>> classType)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        // build
        HttpHost target = new HttpHost(uriBuilder.getHost(), uriBuilder.getPort());
        if (realRequest == null) {
            try {
                build();
            } catch (URISyntaxException e) {
                logger.fatal("url syntax error, uriBuilder=" + uriBuilder.toString());
                throw new KubeInternalErrorException("build uri failed, messge=" + e.getMessage(),
                        e.getCause());
            }
        }
        if (realRequest == null) {
            logger.fatal("http request not build");
            throw new KubeInternalErrorException("unknow reason, httpRequest is null");
        }
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== request to " + target.toString() + " ====\n"
                    + KubeRequestHelper.getFullStringOf(realRequest, "\t"));
        }
        // request
        CloseableHttpResponse response = client.Do(target, realRequest);
        if (logger.isDebugEnabled()) {
            logger.debug("\n\t==== response ====\n"
                    + KubeRequestHelper.getFullStringOf(response, "\t"));
        }

        // handle error
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode == 404) {
            response.close();
            return null;
        } else if (statusCode / 100 != 2) {
            Status errStatus = null;
            try {
                errStatus = objectMapper.readValue(response.getEntity().getContent(), Status.class);
            } finally {
                response.close();
            }
            throw new KubeResponseException(statusCode, errStatus);
        }

        ClosableUnitInputStream<T> result = null;
        try {
            result = classType.newInstance();
        } catch (InstantiationException e) {
            throw new KubeInternalErrorException("create new instance failed", e.getCause());
        } catch (IllegalAccessException e) {
            throw new KubeInternalErrorException("create new instance failed because access illegal", e.getCause());
        }
        result.init(response.getEntity().getContent());
        return result;
    }
}



class KubeRequestHelper {
    public static String getFullStringOf(HttpRequest request, String prefix) {
        String ret = "";
        ret += prefix + request.getRequestLine().toString() + "\n";
        for (Header header : request.getAllHeaders()) {
                ret += prefix + header.toString() + "\n";
        }
        if (request instanceof HttpPut) {
            HttpPut put = (HttpPut)request;
            try {
                ret += prefix + EntityUtils.toString(put.getEntity());
            } catch (IOException e) {
                // ignore this exception and not add entity
            }
        } else if (request instanceof HttpPatch) {
            HttpPatch patch = (HttpPatch)request;
            try {
                ret += prefix + EntityUtils.toString(patch.getEntity());
            } catch (IOException e) {
                // ignore this exception and not add entity
            }
        } else if (request instanceof HttpPost) {
            HttpPost post = (HttpPost)request;
            try {
                ret += prefix + EntityUtils.toString(post.getEntity());
            } catch (IOException e) {
                // ignore this exception and not add entity
            }
        }
        return ret;
    }
    public static String getFullStringOf(HttpResponse response, String prefix) {
        String ret = "";
        ret += prefix + response.getStatusLine().toString() + "\n";
        for (Header header : response.getAllHeaders()) {
            ret += prefix + header.toString() + "\n";
        }
        try {
            HttpEntity responseEntity = new BufferedHttpEntity(response.getEntity());
            ret += prefix + EntityUtils.toString(responseEntity);
            response.setEntity(responseEntity);
        } catch (IOException e) {
            // ignore this exception and not add entity
        }
        return ret;
    }
    public static String getFullStringOf(HttpRequest request) {
        return getFullStringOf(request, "");
    }
    public static String getFullStringOf(HttpResponse response) {
        return getFullStringOf(response, "");
    }
}

class KubeGetRequest extends KubeRequest {
    KubeGetRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }
    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpGet request = new HttpGet();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        realRequest = request;
        return this;
    }
}

class KubePostRequest extends  KubeRequest {
    KubePostRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }

    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpPost request = new HttpPost();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        if (entity != null) {
            request.setEntity(entity);
        }
        realRequest = request;
        return this;
    }
}

class KubePutRequest extends KubeRequest {
    KubePutRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }
    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpPut request = new HttpPut();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        if (entity != null) {
            request.setEntity(entity);
        }
        realRequest = request;
        return this;
    }
}

class KubeDeleteRequest extends KubeRequest {
    KubeDeleteRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }
    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpDelete request = new HttpDelete();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        realRequest = request;
        return this;
    }
}

class KubePatchRequest extends KubeRequest {
    KubePatchRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }

    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpPatch request = new HttpPatch();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        // request.setHeader(new BasicHeader("Content-Type", " application/strategic-merge-patch+json"));
        if (entity != null) {
            request.setEntity(entity);
        }
        realRequest = request;
        return this;
    }
}

class KubeOptionsRequest extends KubeRequest {
    KubeOptionsRequest(KubeRESTClient client, HttpContext context) {
        super(client, context);
    }
    @Override
    protected KubeRequest build() throws URISyntaxException {
        HttpOptions request = new HttpOptions();
        request.setURI(uriBuilder.build());
        if (header != null) {
            request.setHeaders(header.getAllHeaders());
        }
        realRequest = request;
        return this;
    }
}
