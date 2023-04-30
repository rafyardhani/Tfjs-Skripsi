module.exports = {
    adddata: async (req, res) => {
        try {
          const { nama, warna, bentuk, kristal} = req.body;
          console.log(nama)
          await createData({
            nama,
            warna,
            bentuk,
            kristal,
          });
    
          
          res.redirect('/static/index');
        } catch (error) {
          res.redirect('/static/index');
        }
      }
} 