export default {
  label: jest.fn().mockResolvedValue([
    {
      text: "Plastic bottle",
      confidence: 0.95
    },
    {
      text: "Bottle",
      confidence: 0.9
    },
    {
      text: "Container",
      confidence: 0.85
    },
    {
      text: "Beverage",
      confidence: 0.8
    },
    {
      text: "Recyclable",
      confidence: 0.75
    }
  ])
};