package space.copenjs.helpers;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import space.copenjs.copenJS;

public class DatabaseHelper extends copenJS {
    private static MongoDatabase database;
    public static MongoCollection<Document> mongoCollection;
    public static boolean isConnected;

    @SuppressWarnings("DataFlowIssue")
    public static void connectDatabase() {
        try (MongoClient mongoClient = MongoClients.create(NetworkHelper.fetchDatabase("http://localhost/api/database/info"))) {
            database = mongoClient.getDatabase("Scanner");
            mongoCollection = database.getCollection("Servers");
            isConnected = true;
            LOGGER.debug("Successfully connected to the database.");
        } catch (Exception e) {
            LOGGER.warn(String.valueOf(e));
            isConnected = false;
        }
    }
}
