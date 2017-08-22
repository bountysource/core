require 'open3'

fillpdf_path = ENV['FILLPDF_PATH']
asset_dir = "lib/assets/taxform"

form_type = ARGV[0]
pdf_dest = ARGV[1]
data = STDIN.read

pfx_cert = ENV['PFX_CERTIFICATE']
pfx_pwd = ENV['PFX_KEY']

exec_str = "#{fillpdf_path} complete -t #{form_type}_template.json -s #{pfx_cert} -p #{pfx_pwd} #{form_type}.pdf #{pdf_dest}"

Dir.chdir(asset_dir) do
    stdout_str, stderr_str, status = Open3.capture3(exec_str, :stdin_data => data)
    STDERR.puts stderr_str
    puts stdout_str
    exit status.exitstatus
end
