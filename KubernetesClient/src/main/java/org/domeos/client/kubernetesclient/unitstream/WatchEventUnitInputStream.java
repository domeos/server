package org.domeos.client.kubernetesclient.unitstream;

import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.definitions.json.WatchEvent;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Created by anningluo on 15-12-4.
 */
public abstract class WatchEventUnitInputStream<T> extends DefinitionUnitInputStream<T> {
    private static Logger logger = Logger.getLogger(WatchEventUnitInputStream.class);
    @Override
    public T formatOutput(ByteArrayOutputStream stream) throws IOException {
        // logger.debug("stream data = " + stream.toString());
        WatchEvent event = objectMapper.readValue(stream.toByteArray(), WatchEvent.class);
        /*
        logger.debug("event has parsed");
        logger.debug("type:" + event.getType());
        logger.debug("object:" + event.getObject().toString());
        // logger.debug("object = " + event.getObject());
        */
        T result = objectMapper.readValue(event.getObject().toString(), getDefinitionClass());
        // logger.debug("result:" + result);
        return result;
    }
}
