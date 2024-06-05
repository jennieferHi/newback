import dayjs from 'dayjs';

function ISOtodate(date) {
    const data = dayjs(date).format('YYYY-MM-DD');
    return data;
}

export { ISOtodate };