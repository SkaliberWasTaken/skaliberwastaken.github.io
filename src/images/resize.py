from PIL import Image as im

while True:
    fp = input("name: ")
    out_w = 1920 / 2

    data = im.open(fp + ".png", mode="r")
    in_w, in_h = data.size

    ratio = out_w / in_w
    new_dims = (in_w*ratio, in_h*ratio)
    
    data.thumbnail(new_dims, im.ANTIALIAS)
    data.save(fp + "_resized.png")
