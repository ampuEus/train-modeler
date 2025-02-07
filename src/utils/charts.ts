export function update_chart(document: Document, event_name: string, datasets: object[]){
  const event = new CustomEvent(event_name, {
    detail: {
      datasets: datasets
    }
  });
  document.dispatchEvent(event);
}
