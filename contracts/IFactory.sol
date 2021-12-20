interface IFactory {
    function getExchange(address _tokenAddress) external returns (address);
}