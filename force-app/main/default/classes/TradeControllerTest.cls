@isTest
public class TradeControllerTest {

    @TestSetup
    static void makeData() {
        
       List<Trade__c> trades = new List<Trade__c>();
       Trade__c trade1 = new Trade__c(Sell_Currency__c = 'USD',
       Sell_Amount__c = 100,
       Rate__c = 0.98,
       Buy_Currency__c = 'GBP',
       Buy_Amount__c = 98,
       Date_booked__c = Datetime.now());
       trades.add(trade1);

       Trade__c trade2 = new Trade__c(Sell_Currency__c = 'EUR',
       Sell_Amount__c = 100,
       Rate__c = 0.98,
       Buy_Currency__c = 'USD',
       Buy_Amount__c = 98,
       Date_booked__c = Datetime.now().addDays(-1));
       trades.add(trade2);

       insert trades;
    }

    @isTest()
    private static void getBookedTradesTest() {

        Integer pageNumber = 1;
        Integer pageSize = 5;
        
        String tradeResponse = TradeController.getBookedTrades(pageSize, pageNumber);

        // Assertions
        TradeController.TradeWrapper wrapper = (TradeController.TradeWrapper)JSON.deserialize(tradeResponse, TradeController.TradeWrapper.class);
        System.assertEquals(2, wrapper.trades.size(), '2 trade records found');
        
    }
    
    @isTest()
    private static void insertTradeTest() {

        Trade__c trade = new Trade__c(Sell_Currency__c = 'USD',
       	Sell_Amount__c = 100,
       	Rate__c = 0.98,
       	Buy_Currency__c = 'GBP',
       	Buy_Amount__c = 98,
       	Date_booked__c = Datetime.now());
        
        TradeController.insertTrade(trade);

        // Assertions
        List<Trade__c> tradeList = [Select Id, Name From Trade__c];

        // Assertions
        System.assertEquals(true, tradeList[0].Name.contains('TR-0'), 'Contains automated number name');
        
    }
    

}