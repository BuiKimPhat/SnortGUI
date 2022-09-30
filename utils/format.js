export const NumberDotFormat = num => {
    const strnum = String(num)
    var count = 0;
    var res = "";
    for (let i=strnum.length-1; i>=0 ; i--){
        if (count > 0 && count%3==0) res = "," + res;
        res = strnum[i] + res;
        count++;
    }
    return res;
}