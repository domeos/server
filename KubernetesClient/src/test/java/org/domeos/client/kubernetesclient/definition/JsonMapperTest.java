package org.domeos.client.kubernetesclient.definition;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import junit.framework.TestCase;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by anningluo on 15-11-26.
 */
public class JsonMapperTest extends TestCase{
    ObjectMeta case0;
    ObjectMapper mapper;
    @Before
    public void setUp() {
        mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
        case0 = new ObjectMeta();
        case0.setCreationTimestamp("121212121");
        case0.setDeletionGracePeriodSeconds(2222222);
        Map<String, String> annotation = new HashMap();
        // annotation.put("test", "case");
        // annotation.put("hi", "world");
        // case0.setAnnotations(annotation);
        case0.setDeletionTimestamp("323232323");
        case0.setGenerateName("generate");
        case0.setGeneration(432156);
        Map<String, String> label = new HashMap();
        label.put("meta", "none");
        label.put("id", "test");
        case0.setLabels(label);
        case0.setName("test");
        case0.setGeneration(1);
        case0.setNamespace("anl");
    }
    @Test
    public void testMapAndUnmapToByte() throws IOException {
        byte[] data;
        data = mapper.writeValueAsBytes(case0);
        ObjectMeta newMeta = new ObjectMeta();
        newMeta = mapper.readValue(data, ObjectMeta.class);
        System.out.println("case0:");
        System.out.println(case0);
        System.out.println("newMeta");
        System.out.println(newMeta);
        System.out.println("data");
        System.out.println(new String(data));
        System.out.println("str");
        String case0JsonStr = mapper.writeValueAsString(case0);
        System.out.println(case0JsonStr);
        ObjectMeta newMeta2 = mapper.readValue(case0JsonStr, ObjectMeta.class);
        System.out.println(newMeta2);
        // Assert.assertTrue("map failed", newMeta.toString().equals(data.toString()));
    }
    @After
    public void inEnd() {
        System.out.println("******** end test *********");
    }
}
