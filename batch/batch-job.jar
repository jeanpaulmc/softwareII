import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SparkSession;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.file.Files;
import java.nio.file.Paths;

public class SparkMongoJob {
    private String inputUri;
    private String outputUri;

    public SparkMongoJob(String inputUri, String outputUri) {
        this.inputUri = inputUri;
        this.outputUri = outputUri;
    }

    public void run() {
        SparkSession spark = SparkSession.builder()
                .appName("SparkMongoJob")
                .master("local")
                .config("spark.mongodb.input.uri", inputUri)
                .config("spark.mongodb.output.uri", outputUri)
                .getOrCreate();

        Dataset<Row> df = spark.read()
                .format("csv")
                .option("header", "true")
                .load("./data/worldcities.csv");

        df.write()
                .format("mongo")
                .mode("append")
                .save();

        spark.stop();
    }
}

public class ConfigReader {
    private String configFilePath;

    public ConfigReader(String configFilePath) {
        this.configFilePath = configFilePath;
    }

    public String[] getUris() throws Exception {
        String configContent = new String(Files.readAllBytes(Paths.get(configFilePath)));

        JSONObject configJson = new JSONObject(configContent);

        JSONArray uriArray = configJson.getJSONArray("uris");

        String[] uris = new String[uriArray.length()];
        for (int i = 0; i < uriArray.length(); i++) {
            uris[i] = uriArray.getString(i);
        }

        return uris;
    }
}

public class BatchJobWrapper {
    public static void main(String[] args) {
        try {
            String configFilePath = "./deployment-config.json";
            ConfigReader configReader = new ConfigReader(configFilePath);
            String[] uris = configReader.getUris();

            SparkMongoJob sparkMongoJob = new SparkMongoJob(uris[0], uris[1]);
            sparkMongoJob.run();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

