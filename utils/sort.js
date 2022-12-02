export const quickSortByTime = (arr, ascending) => {

    if(arr.length < 2) return arr;
    
    const pivotIndex = arr.length - 1;
    const pivot = arr[pivotIndex];

    const left = [];
    const right = [];
    
    let currentItem;
    for(let i = 0; i < pivotIndex; i++) {
        currentItem = arr[i];
        
        if(ascending ? currentItem < pivot : currentItem > pivot) {
            left.push(currentItem);
        } else {
            right.push(currentItem);
        }
    }

    return [...quickSortByTime(left), pivot, ...quickSortByTime(right)];
}
