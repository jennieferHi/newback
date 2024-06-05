import dayjs from 'dayjs';
// 範例
export const date = (json) => {
const json2 = `[
    {"id": 1, "name": "John", "date": "2024-04-15T10:30:00Z"},
    {"id": 2, "name": "Jane", "date": "2024-04-14T08:45:00Z"},
    {"id": 3, "name": "Bob", "date": "2024-04-16T12:15:00Z"}
]`;

// Parse JSON data
const data = JSON.parse(json);

// Format the date field into a string
data.forEach(item => {
    item.date = dayjs(item.date).format('YYYY-MM-DD HH:mm:ss');
});

// Sort by date field (ascending)
data.sort((a, b) => a.date.localeCompare(b.date));

// Display the sorted results
console.log(data);
return date;
};