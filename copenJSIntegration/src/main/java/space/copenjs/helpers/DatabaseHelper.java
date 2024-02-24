package space.copenjs.helpers;

import com.mongodb.client.*;
import com.mongodb.client.model.Aggregates;
import org.bson.Document;
import space.copenjs.copenJS;

import java.util.List;

public class DatabaseHelper extends copenJS {
    private static MongoDatabase database;
    public static MongoCollection<Document> mongoCollection;
    public static boolean isConnected = false;

    @SuppressWarnings("DataFlowIssue")
    public static void connectDatabase() {
        MongoClient mongoClient = MongoClients.create("mongodb+srv://" + NetworkHelper.fetchDatabase("http://ui.copenjs.space/api/database/info") + "@ui.copenjs.space/?tls=false");
            database = mongoClient.getDatabase("Scanner");
            mongoCollection = database.getCollection("Servers");
            isConnected = true;
            LOGGER.debug("Successfully connected to the database.");
    }
    public static AggregateIterable<Document> fetchServers() {
        return mongoCollection.aggregate(List.of(Aggregates.sample(30)));
    }
}