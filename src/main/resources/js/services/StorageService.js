/**
 * Perform the operations related to Storage.
 */
var StorageService = function() {
    var self = this;

    /**
     * Saves the key with the value in the local storage.
     * @param  {String} key   The key name.
     * @param  {String} value The value to store
     */
    self.storeKey = function(key, value) {
    	window.localStorage.setItem(key, value);
    };

    /**
     * Wrapper for localstorage removeItem, this wrapper
     * could be use to set or use
     * @param  {String} key The Key to delete
     */
    self.removeKey = function(key) {
        window.localStorage.removeItem(key);
    }

    /**
     * Returns the value of the key.
     * @param  {String} key The key name.
     * @return {String}     The value of the key
     */
    self.getKey = function(key) {
        if( typeof(window.localStorage) !== "undefined") {
    	   return window.localStorage.getItem(key);
        }
        else{
            console.log("local storage is not supported");
        }
    };
};
/**
 * Creates the service instance.
 */
var storageService =  new StorageService();