// Utility function to make JSON hierarchy from SQL flat data.

class Utility {

    constructor() {}

    sqlToJsonHierarchy(array) {

        let map = {};

        for(let i = 0; i < array.length; i++) {

            let arrayElement = array[i]
            
            arrayElement.children = []
            map[arrayElement.id] = arrayElement

            let parent = arrayElement.parent_id || '-'

            if(!map[parent]) {
                map[parent] = {
                    children: []
                }
            }
            map[parent].children.push(arrayElement)
        }
        return map['-'].children
    }

    accumulateChildEntries(data, parent_id) {

        let accumulator = [data.find(item => item.id === parseInt(parent_id))]

        this.getAllChildEntries(data, parent_id, accumulator)
        return accumulator
            
    }

    getAllChildEntries(data, parent_id, accumulator) {

        if(parent_id) {
            const arr = data.filter(item => item.parent_id === parseInt(parent_id))
            if(arr.length) {
                accumulator.push(...arr)
                arr.forEach(item => this.getAllChildEntries(data, item.id, accumulator))
            }
        }
    }
}

module.exports = new Utility()