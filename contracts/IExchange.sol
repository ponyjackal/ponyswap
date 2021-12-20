interface IExchange {
    function ethToTokenTransfer(uint256 _minTokens, address _recipient) external payable;
}