import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDbConnection {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://34.64.165.245:3306/upme?useSSL=false&allowPublicKeyRetrieval=true";
        String username = "root";
        String password = "sqlpass0525*";

        System.out.println("Connecting to database at " + jdbcUrl);

        try {
            Connection connection = DriverManager.getConnection(jdbcUrl, username, password);
            System.out.println("Connection successful!");
            connection.close();
        } catch (SQLException e) {
            System.out.println("Connection failed:");
            e.printStackTrace();
        }
    }
}
