module.exports = [
  {
    path: "sub_directories",
    select: { directory_name: 1 },
  },
  {
    path: "files",
    select: { file_name: 1, file_url: 1, extension: 1 },
  },
];
