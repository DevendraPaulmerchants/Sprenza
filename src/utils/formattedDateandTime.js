const date = new Date();

export const formattedDate = date.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const formattedTime = date.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const dateAndTime = data => {
  if (!data) {
    const formattedDate = 'No data';
    const formattedTime = 'No data';
    return { formattedDate, formattedTime };
  }
  const date = new Date(data);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { formattedDate, formattedTime };
};
