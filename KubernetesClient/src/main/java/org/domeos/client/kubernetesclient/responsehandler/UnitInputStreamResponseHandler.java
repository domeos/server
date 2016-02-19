package org.domeos.client.kubernetesclient.responsehandler;


import org.apache.http.client.ClientProtocolException;
import org.domeos.client.kubernetesclient.unitstream.UnitInputStream;

import java.io.IOException;

/**
 * Created by anningluo on 15-12-4.
 */
public interface UnitInputStreamResponseHandler<T> {
    // This function will be call after http response has been analysis as 2xx and before the body is fully translate.
    // Input stream is the body which has been separated into units and analysis as T
    public void handleResponse(UnitInputStream<T> input) throws ClientProtocolException, IOException;
}
