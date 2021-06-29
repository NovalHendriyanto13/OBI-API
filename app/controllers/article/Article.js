'use strict'
const path = require('path')
const config = require(path.resolve('config/config'))
const util = require(path.resolve('app/utils/util'))

const Controller = require(config.controller_path + '/Controller')

class Article extends Controller {
    constructor() {
        super()
    }

    async index(req, res) {
        try{
            const access = util.staticToken(req, res)
            if (access === false) {
                res.send(this.response(false, null, 'You are not authorized!'))
            }
            
            res.send(this.response(true, "ii", null))
        }
        catch(err) {
            console.log(err)
            res.send(this.response(false, null, {
                code: err.code,
                message: err.message
            }))
        } 
    }

    async termCondition(req, res) {
        let html = '<p><h3>SYARAT & KETENTUAN LELANG PT. OTO BID INDONESIA :</h3>'
            html = html + '<ol>'
            html = html + '<li>Calon pembeli yang berminat mengikuti lelang harus mendaftarkan diri melalui situs website PT. Oto Bid Indonesia (OTO BID) www.otobid.co.id untuk menjadi Peserta Lelang dengan wajib mengisi form/kolom yang tersedia sesuai dengan KTP yang berlaku dan wajib melengkapi dokumen fotokopi identitas diri/KTP dan NPWP.</li>'
            html = html + '<li>Calon Pembeli tidak dapat mengikuti proses lelang apabila tidak melampirkan dokumen fotokopi identitas diri/KTP dan NPWP.</li>'
            html = html + '<li>Peserta Lelang wajib menjaga kerahasiaan user ID dan password masing-masing. OTO BID tidak bertanggung jawab atas segala akibat penyalahgunaan akun Peserta Lelang.</li>'
            html = html + '<li>Peserta Lelang menyetujui transaksi yang dilakukan melalui aplikasi Lelang Melalui Internet.</li>'
            html = html + '<li>Setiap peserta lelang wajib menyetorkan uang jaminan sebesar : <ul>'
                html = html + '<li>Rp. 5.000.000,- per unit Mobil dan Alat Berat</li>'
                html = html + '<li>Rp. 1.000.000,- per unit Motor</li></ul><br>'
            html = html + 'ke rekening masing-masing lokasi lelang OTO BID sebagai berikut : <ul>'
                html = html + '<li>OTO BID Makassar : BCA 8650 525656, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Pekanbaru : BCA 8650 523131, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Surabaya : BCA 8650 525656, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Tangerang  : BCA 8650 569998, Cabang Pantai Indah Kapuk, Jakarta</li></ul></li>'
            html = html + '<li>Setelah uang jaminan dikonfirmasi telah diterima, OTO BID akan mengeluarkan/mengaktifkan Nomor Peserta Lelang (NPL) sebagai syarat untuk melakukan Penawaran.</li>'
            html = html + '<li>Peserta Lelang tunduk dan taat pada semua peraturan yang telah ditetapkan oleh PT. Oto Bid Indonesia.</li></ol></p>'
        
            html = html + '<p><h3>PROSES LELANG</h3><ol>'
            html = html + '<li>Waktu Peserta Lelang untuk melakukan penawaran: <ul>'
                html = html + '<li>Untuk penawaran tertutup (closed bidding), penawaran Lelang di buka pada saat objek Lelang di upload pada system / web OTO BID dan di tutup sekurang-kurangnya 30 menit sebelum kepala risalah Lelang ditayangkan sesuai jadwal Lelang pada system website OTO BID.</li>'
                html = html + '<li>Untuk penawaran terbuka (open bidding), penawaran Lelang di buka/mulai pada saat kepala risalah Lelang ditayangkan/dibacakan oleh Pejabat Lelang sesuai jadwal Lelang pada sistem website OTO BID dan ditutup hingga seluruh unit ditawarkan dalam lelang selesai.</li></ul></li>'

            html = html + '<li>Waktu yang digunakan adalah waktu server OTO BID.</li>'        
            html = html + '<li>Peserta Lelang dianggap melakukan penawaran lelang secara sadar tanpa paksaan dari pihak mana pun dan penawaran lelang bersifat mengikat dan sah.</li>'        
            html = html + '<li>Peserta Lelang bertanggung jawab penuh atas transaksi dan/atau penawaran elektronik yang dilakukan dengan menggunakan aplikasi Lelang Melalui Internet.</li>'        
            html = html + '<li>Lelang yang akan dilaksanakan dapat dibatalkan atas permintaan penjual, berdasarkan pertimbangan dari pejabat lelang, atau karena gangguan teknis yang tidak dapat ditanggulangi/force majeur, sesuai peraturan perundang-undangan yang mengatur tentang petunjuk pelaksanaan lelang.</li>'        
            html = html + '<li>Jika terjadi pembatalan lelang sebelum maupun setelah pelaksanaan lelang karena permintaan Penjual, maka Pejabat Lelang memberitahukan kepada Peserta Lelang melalui aplikasi Lelang Melalui Internet, surat elektronik (email), telepon, website, short message service, dan/ atau papan pengumuman pada Penyelenggara Lelang Melalui Internet atau Website OTO BID.</li>'        
            html = html + '<li>Dalam hal terjadi pembatalan lelang sebelum maupun setelah pelaksanaan lelang karena permintaan Penjual, atau oleh Pejabat Lelang, maka Peserta Lelang tidak berhak menuntut ganti rugi.</li>'        
            html = html + '<li>Penawar/Pembeli dianggap sungguh-sungguh telah mengetahui apa yang telah ditawar/dibeli olehnya. Apabila terdapat kekurangan/kerusakan baik yang terlihat ataupun yang tidak terlihat, maka Penawar/Pembeli tidak berhak untuk menolak atau menarik diri kembali setelah pembelian disahkan dan melepaskan segala hak untuk meminta kerugian atas sesuatu apapun juga.</li>'        
            html = html + '<li>Pengesahan Pembeli : <ul>'
                html = html + '<li>Peserta Lelang dengan penawaran tertinggi yang telah mencapai atau melampaui Nilai Limit disahkan oleh Pejabat Lelang sebagai Pembeli.</li>'
                html = html + '<li>Jika terdapat penawaran tertinggi yang sama, yang diterima lebih dahulu akan disahkan oleh Pejabat Lelang sebagai Pembeli.</li></ul></li>'
            html = html + '<li>Pelunasan kewajiban pembayaran lelang oleh Pembeli dilakukan secara transfer paling lambat 3 (tiga) hari kerja setelah pelaksanaan Lelang ke Rekening masing-masing Cabang OTO BID yaitu : <ul>'
                html = html + '<li>OTO BID Makassar : BCA 8650 525656, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Pekanbaru : BCA 8650 523131, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Surabaya : BCA 8650 525656, Cabang Pantai Indah Kapuk, Jakarta</li>'
                html = html + '<li>OTO BID Tangerang : BCA 8650 569998, Cabang Pantai Indah Kapuk, Jakarta</li></ul></li>'
            html = html + '<li>Peserta Lelang yang melakukan penawaran menggunakan kartu NPL dinyatakan menang atau kalah dalam acara lelang, diwajibkan mengembalikan kartu NPL dalam kondisi baik. Apabila NPL Hilang/Rusak akan dikenakan denda sebesar Rp. 500.000/Kartu NPL.</li>'
            html = html + '<li>Peserta Lelang yang telah disahkan sebagai Pembeli bertanggung jawab sepenuhnya atas pelunasan kewajiban pembayaran lelang dengan ditambah biaya admin sesuai Harga Terbentuk yaitu : <ul>'
                html = html + '<li>Biaya Admin Motor : Rp. 300.000,-/Unit Motor</li>'
                html = html + '<li>Biaya Admin Mobil : Rp. 2.000.000,-/Unit Mobil(* untuk unit yang terjual dengan Harga Terbentuk dalam Lelang sebesar maksimal Rp. 249.500.000,-) </li>'
                html = html + '<li>Biaya Admin Mobil : Rp. 2.500.000,-/Unit Mobil(* untuk unit yang terjual dengan Harga Terbentuk dalam Lelang sebesar minimal Rp. 250.000.000,-)</li>'
                html = html + '<li>Biaya Admin Alat Berat : Rp. 3.000.000,-/Unit Alat Berat</li></ul></li>'
            html = html + '<li>Apabila dalam tenggang waktu tersebut, 3 (tiga) hari kerja tidak dilunasi, maka pemenang dianggap mengundurkan diri dan total uang jaminan menjadi HANGUS.</li>'
            html = html + '<li>Pembeli tidak diperkenankan mengambil/menguasai barang yang dibelinya sebelum memenuhi kewajiban pembayaran lelang. Apabila Pembeli melanggar ketentuan ini, maka dianggap telah melakukan suatu tindak kejahatan yang dapat dituntut oleh pihak yang berwajib.</li>'
            html = html + '<li>Barang yang telah terjual pada lelang ini menjadi hak dan tanggungan Pembeli dan harus dengan segera mengurus barang tersebut maksimal 7 (Tujuh) hari setelah Lelang. Apabila melewati batas waktu yang disebutkan maka akan dikenakan biaya Parkir sebesar Rp. 100.000,-/Hari.</li>'
            html = html + '<li>Apabila sampai dengan batas waktu yang ditentukan obyek lelang belum juga diambil, maka OTO BID tidak akan menanggung segala resiko yang timbul.</li>'
            html = html + '<li>Bagi Peserta Lelang yang tidak disahkan sebagai Pembeli, Jaminan Penawaran Lelang yang telah disetorkan akan dikembalikan seluruhnya tanpa potongan, kecuali terdapat biaya transaksi yang dikenakan oleh perbankan, maka menjadi tanggungan Peserta Lelang paling lama 3 (tiga) hari kerja terhitung setelah Lelang untuk Nomor rekening refund Bank BCA dan paling lama 5 (lima) hari kerja terhitung setelah Lelang untuk Nomor rekening refund selain Bank BCA.</li>'
            html = html + '<li>Jaminan Penawaran Lelang akan dikembalikan sesuai dengan nomor rekening yang telah didaftarkan dalam akun masing-masing peserta lelang.</li>'
            html = html + '<li>Apabila ada perubahan data yang dilakukan setelah proses lelang maka data yang akan kami gunakan adalah data laporan hasil lelang sesaat setelah lelang berakhir.</li></ol></p>'
        
            html = html + '<p><h3>KETENTUAN-KETENTUAN LAIN</h3><ol>'
            html = html + '<li>Dalam hal terdapat gangguan teknis atas aplikasi dalam pelaksanaan Lelang Melalui Internet, yang terjadi sebelum atau setelah penayangan Kepala Risalah Lelang, Pejabat Lelang berwenang mengambil tindakan sesuai dengan ketentuan.</li>'
            html = html + '<li>Penyelenggara Lelang Melalui Internet memberitahukan adanya gangguan teknis dan/atau kondisi kahar kepada Peserta Lelang menggunakan aplikasi Lelang Melalui Internet, surat elektronik (email, telepon, website, short message service, dan/atau papan pengumuman pada Penyelenggara Lelang Melalui Internet.</li>'
            html = html + '<li>Dalam hal terjadi pembatalan lelang akibat adanya gangguan teknis dan/atau kondisi kahar terkait pelaksanaan lelang dengan penawaran menggunakan aplikasi Lelang Melalui Internet, maka Penjual, Peserta Lelang, dan/atau pihak lain tidak dapat menuntut ganti rugi.</li>'
            html = html + '<li>Peserta Lelang tidak akan menuntut Pejabat Lelang dan OTO BID, Unit Pengelola TIK, dan Penyelenggara Lelang Melalui Internet, baik secara perdata maupun pidana dalam hal terdapat kondisi Gangguan Teknis atau permasalahan pada aplikasi Lelang Melalui Internet.</li>'
            html = html + '<li>Waktu yang ditampilkan oleh aplikasi pada perangkat peserta lelang dapat berbeda dengan waktu server pada Penyelenggara Lelang Melalui Internet sebagai akibat dari ketidakandalan jaringan komunikasi data yang digunakan oleh Peserta Lelang.</li>'
            html = html + '<li>Data penawaran yang mengikat dan sah adalah penawaran yang masuk dan tercatat sesuai dengan waktu server pada Penyelenggara Lelang Melalui Internet, bukan waktu yang ditampilkan oleh aplikasi pada perangkat peserta lelang.</li>'
            html = html + '<li>Pejabat Lelang, dan OTO BID selaku Penyelenggara Lelang Melalui Internet dibebaskan dari tanggung jawab atas kerugian yang timbul : <ul>'
                html = html + '<li>Karena kesalahan dan/atau kelalaian yang dilakukan oleh Peserta Lelang atau pihak lain dalam proses penawaran lelang;</li>'
                html = html + '<li>Karena kegagalan peserta dalam memproses penawaran lelang yang diakibatkan oleh gangguan teknis pada jaringan komunikasi data yang digunakan oleh Peserta Lelang; dan</li>'
                html = html + '<li>Akibat tindakan pihak lain yang mengatasnamakan OTO BID Melalui Internet dan merugikan Peserta Lelang.</li></ul></li>'
            html = html + '<li>Peserta Lelang setuju bahwa usaha untuk memanipulasi data, mengacaukan sistem elektronik dan jaringannya adalah tindakan melanggar hukum dan akan ditindak sesuai hukum yang berlaku di Indonesia</li>'
            html = html + '<li>Semua informasi resmi yang terkait dengan transaksi keuangan hanya dapat diperoleh dengan mengakses aplikasi Lelang Melalui website PT. Oto Bid Indonesia.</li>'
            html = html + '<li>Khusus untuk pembelian dalam lelang ini, maka Penawar/Pembeli tunduk pada hukum perdata dan hukum dagang yang berlaku di Indonesia.</li>'
        return res.send(this.response(true, html, null))
    }
}

module.exports = Article