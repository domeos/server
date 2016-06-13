package org.domeos.client.kubernetesclient.responsehandler;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpRequestBase;
import org.domeos.client.kubernetesclient.definitions.unversioned.Status;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;
import org.domeos.client.kubernetesclient.unitstream.factory.ClosableUnitInputStreamFactory;

import java.io.IOException;

/**
 * Created by anningluo on 15-12-4.
 */
public class RestClientResponseHandler<T> implements ResponseHandler<Status> {
    private ClosableUnitInputStream<T> unitInputStream;
    private UnitInputStreamResponseHandler<T> responseHandler;
    private HttpRequestBase thisRequest;
    public RestClientResponseHandler(ClosableUnitInputStreamFactory<T> factory,
                                     UnitInputStreamResponseHandler<T> handler,
                                     HttpRequestBase request) {
        this.unitInputStream = factory.createUnitInputStream();
        this.thisRequest = request;
        responseHandler = handler;
    }
    protected static ObjectMapper objectMapper = initObjectMapper();
    private static ObjectMapper initObjectMapper() {
        ObjectMapper tmpObjectMapper = new ObjectMapper();
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        tmpObjectMapper.setSerializationInclusion(JsonInclude.Include.NON_DEFAULT);
        // tmpObjectMapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
        return tmpObjectMapper;
    }
    @Override
    public Status handleResponse(HttpResponse response) throws ClientProtocolException, IOException {
        // handle error
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode == 404) {
            responseHandler.handleResponse(null);
            return null;
        } else if (statusCode / 100 != 2) {
            return objectMapper.readValue(response.getEntity().getContent(), Status.class);
        }

        this.unitInputStream.init(response.getEntity().getContent());
        try {
            responseHandler.handleResponse(this.unitInputStream);
        } finally {
            thisRequest.abort();
            unitInputStream.close();
        }
        return null;
        // throw new IOException("interrupt");
        /*
        unitInputStream.close();
        System.out.println("==== close done ====");
        return null;
        */
    }
}
